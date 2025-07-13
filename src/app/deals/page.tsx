"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { collection, addDoc, query, where, onSnapshot, Timestamp, orderBy, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRef } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function fetchAddressSuggestions(query: string) {
  if (!query || !MAPBOX_TOKEN) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.features?.map((f: { place_name: string }) => f.place_name) || [];
}

function safeDisplay(val: unknown): string {
  if (typeof val === 'number') return val.toLocaleString();
  if (typeof val === 'string') return val;
  return '';
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState({
    address: "",
    client: "",
    closeDate: "",
    gci: "",
    brokerageSplit: "",
    referralFee: "",
    transactionFee: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const addressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: unknown) => {
      setUser(user);
      setAuthLoading(false);
      if (!user) router.replace("/signin");
    });
    return () => unsub();
  }, [router]);

  // Fetch deals for current user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "deals"), where("userId", "==", (user as { uid: string }).uid), orderBy("closeDate", "desc"));
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDeals(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Calculate net commission
  function calcNetCommission(gci: number, brokerageSplit: number, referralFee: number, transactionFee: number) {
    const split = gci * (brokerageSplit / 100);
    return gci - split - referralFee - transactionFee;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "address") {
      clearTimeout(addressTimeout.current);
      addressTimeout.current = setTimeout(async () => {
        setAddressSuggestions(await fetchAddressSuggestions(value));
      }, 300);
    }
  };

  const selectAddress = (address: string) => {
    setForm((f) => ({ ...f, address }));
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!user) throw new Error("You must be signed in.");
      const gci = parseFloat(form.gci) || 0;
      const brokerageSplit = parseFloat(form.brokerageSplit) || 0;
      const referralFee = parseFloat(form.referralFee) || 0;
      const transactionFee = parseFloat(form.transactionFee) || 0;
      const netCommission = calcNetCommission(gci, brokerageSplit, referralFee, transactionFee);
      await addDoc(collection(db, "deals"), {
        userId: (user as { uid: string }).uid,
        address: form.address,
        client: form.client,
        closeDate: form.closeDate,
        gci,
        brokerageSplit,
        referralFee,
        transactionFee,
        netCommission,
        createdAt: Timestamp.now(),
      });
      setForm({ address: "", client: "", closeDate: "", gci: "", brokerageSplit: "", referralFee: "", transactionFee: "" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add deal";
      setError(errorMessage);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Loading deals...</div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deals</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Deal</h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit} autoComplete="off">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
            {addressSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                {addressSuggestions.map((s, i) => (
                  <li key={i} className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => selectAddress(s)}>{s}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input type="text" name="client" value={form.client} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Close Date</label>
            <input type="date" name="closeDate" value={form.closeDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GCI</label>
            <input type="number" name="gci" value={form.gci} onChange={handleChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Split %</label>
            <input type="number" name="brokerageSplit" value={form.brokerageSplit} onChange={handleChange} step="0.01" min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Fee</label>
            <input type="number" name="referralFee" value={form.referralFee} onChange={handleChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Fee</label>
            <input type="number" name="transactionFee" value={form.transactionFee} onChange={handleChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="sm:col-span-2 flex flex-col items-end gap-2">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Add Deal</button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Your Deals</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Address</th>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">GCI</th>
                <th className="px-3 py-2 text-left">Net Commission</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td className="px-3 py-2">{String(deal.address ?? "")}</td>
                  <td className="px-3 py-2">{String(deal.client ?? "")}</td>
                  <td className="px-3 py-2">{String(deal.closeDate ?? "")}</td>
                  <td className="px-3 py-2">${safeDisplay(deal.gci)}</td>
                  <td className="px-3 py-2">${safeDisplay(deal.netCommission)}</td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-4">No deals yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 