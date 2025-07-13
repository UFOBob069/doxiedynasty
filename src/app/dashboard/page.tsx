"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function fetchAddressSuggestions(query: string) {
  if (!query || !MAPBOX_TOKEN) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.features?.map((f: any) => f.place_name) || [];
}

async function getMiles(begin: string, end: string) {
  if (!begin || !end || !MAPBOX_TOKEN) return null;
  // Geocode both addresses
  const geocode = async (address: string) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.features?.[0]?.center;
  };
  const beginCoord = await geocode(begin);
  const endCoord = await geocode(end);
  if (!beginCoord || !endCoord) return null;
  // Get driving distance
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${beginCoord[0]},${beginCoord[1]};${endCoord[0]},${endCoord[1]}?access_token=${MAPBOX_TOKEN}&overview=false`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const meters = data.routes?.[0]?.distance;
  if (!meters) return null;
  return meters / 1609.34; // meters to miles
}

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const [mileageModalOpen, setMileageModalOpen] = useState(false);
  const [mileageForm, setMileageForm] = useState({
    begin: "",
    end: "",
    roundTrip: false,
    miles: "",
    deal: "",
    costPerMile: "0.67",
  });
  const [mileageLoading, setMileageLoading] = useState(false);
  const [mileageError, setMileageError] = useState("");
  const [beginSuggestions, setBeginSuggestions] = useState<string[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<string[]>([]);
  const [calculatedMiles, setCalculatedMiles] = useState<number|null>(null);
  const beginTimeout = useRef<any>();
  const endTimeout = useRef<any>();

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
      if (!user) router.replace("/signin");
    });
    return () => unsub();
  }, [router]);

  // Fetch expenses for current user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  // Placeholder for GCI and Net Income (real deal data not yet implemented)
  const totalGCI = 0;
  const netIncome = totalGCI - totalExpenses;

  // Chart data (last 6 months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const netIncomeHistory = months.map((m, i) => netIncome - i * 100); // Placeholder

  const handleMileageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setMileageForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (name === "begin") {
      clearTimeout(beginTimeout.current);
      beginTimeout.current = setTimeout(async () => {
        setBeginSuggestions(await fetchAddressSuggestions(value));
      }, 300);
    }
    if (name === "end") {
      clearTimeout(endTimeout.current);
      endTimeout.current = setTimeout(async () => {
        setEndSuggestions(await fetchAddressSuggestions(value));
      }, 300);
    }
    // Reset calculated miles if addresses change
    if (name === "begin" || name === "end" || name === "roundTrip") {
      setCalculatedMiles(null);
    }
  };

  const selectBegin = (address: string) => {
    setMileageForm((f) => ({ ...f, begin: address }));
    setBeginSuggestions([]);
    setCalculatedMiles(null);
  };
  const selectEnd = (address: string) => {
    setMileageForm((f) => ({ ...f, end: address }));
    setEndSuggestions([]);
    setCalculatedMiles(null);
  };

  const handleCalculateMiles = async () => {
    setMileageError("");
    setCalculatedMiles(null);
    setMileageLoading(true);
    try {
      const miles = await getMiles(mileageForm.begin, mileageForm.end);
      if (miles == null) throw new Error("Could not calculate distance between addresses.");
      setCalculatedMiles(mileageForm.roundTrip ? miles * 2 : miles);
    } catch (err: any) {
      setMileageError(err.message || "Failed to calculate miles");
    } finally {
      setMileageLoading(false);
    }
  };

  const handleMileageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMileageError("");
    setMileageLoading(true);
    try {
      if (!user) throw new Error("You must be signed in.");
      let miles = calculatedMiles;
      if (miles == null) {
        miles = await getMiles(mileageForm.begin, mileageForm.end);
        if (miles == null) throw new Error("Could not calculate distance between addresses.");
        if (mileageForm.roundTrip) miles *= 2;
      }
      const costPerMile = parseFloat(mileageForm.costPerMile) || 0.67;
      const amount = miles * costPerMile;
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        date: new Date().toISOString().slice(0, 10),
        category: "Mileage",
        amount,
        notes: `${miles.toFixed(2)} miles from ${mileageForm.begin} to ${mileageForm.end}${mileageForm.roundTrip ? " (round trip)" : ""} @ $${costPerMile.toFixed(2)}/mile`,
        deal: mileageForm.deal,
        receiptUrl: "",
        createdAt: Timestamp.now(),
        miles: miles,
        costPerMile,
      });
      setMileageForm({ begin: "", end: "", roundTrip: false, miles: "", deal: "", costPerMile: "0.67" });
      setCalculatedMiles(null);
      setMileageModalOpen(false);
    } catch (err: any) {
      setMileageError(err.message || "Failed to add mileage expense");
    } finally {
      setMileageLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Total GCI</span>
          <span className="text-2xl font-semibold text-green-600">${totalGCI.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Total Expenses</span>
          <span className="text-2xl font-semibold text-red-500">${totalExpenses.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <span className="text-gray-500 text-sm">Net Income</span>
          <span className="text-2xl font-semibold text-blue-600">${netIncome.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <span className="text-gray-500 text-sm">Net Income Over Time</span>
        {/* Simple bar chart placeholder */}
        <div className="flex items-end h-32 mt-2 space-x-2">
          {netIncomeHistory.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-6 rounded-t"
                style={{ height: `${(val / Math.max(...netIncomeHistory, 1)) * 100}%` }}
              ></div>
              <span className="text-xs mt-1 text-gray-400">{months[idx]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <button
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => router.push('/deals')}
        >
          Add New Deal
        </button>
        <button
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition"
          onClick={() => router.push('/expenses')}
        >
          Add Expense
        </button>
        <button
          className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-semibold shadow hover:bg-green-200 transition"
          onClick={() => setMileageModalOpen(true)}
        >
          Log Mileage
        </button>
      </div>
      {/* Mileage Modal */}
      {mileageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setMileageModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Log Mileage</h2>
            <form className="grid grid-cols-1 gap-4" onSubmit={handleMileageSubmit} autoComplete="off">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Begin Address</label>
                <input type="text" name="begin" value={mileageForm.begin} onChange={handleMileageChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
                {beginSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                    {beginSuggestions.map((s, i) => (
                      <li key={i} className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => selectBegin(s)}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Address</label>
                <input type="text" name="end" value={mileageForm.end} onChange={handleMileageChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required autoComplete="off" />
                {endSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                    {endSuggestions.map((s, i) => (
                      <li key={i} className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => selectEnd(s)}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="roundTrip" checked={mileageForm.roundTrip} onChange={handleMileageChange} id="roundTrip" />
                <label htmlFor="roundTrip" className="text-sm text-gray-700">Round Trip</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Mile</label>
                <input type="number" name="costPerMile" value={mileageForm.costPerMile} onChange={handleMileageChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag to Deal (optional)</label>
                <input type="text" name="deal" value={mileageForm.deal} onChange={handleMileageChange} placeholder="Deal address or ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex flex-col items-end gap-2">
                {mileageError && <div className="text-red-600 text-sm">{mileageError}</div>}
                <button type="button" onClick={handleCalculateMiles} disabled={mileageLoading || !mileageForm.begin || !mileageForm.end} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition disabled:opacity-60 mb-2">
                  {mileageLoading ? "Calculating..." : "Calculate Miles"}
                </button>
                {calculatedMiles !== null && (
                  <div className="text-green-700 text-sm mb-2">{calculatedMiles.toFixed(2)} miles</div>
                )}
                <button type="submit" disabled={mileageLoading || !calculatedMiles} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60">
                  {mileageLoading ? "Adding..." : "Add Mileage Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TODO: Implement deal creation modal or form on /deals */}
    </main>
  );
} 