"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage, auth } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const categories = [
  "Mileage",
  "Meals",
  "Software",
  "Marketing",
  "Supplies",
  "Education",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "",
    category: "",
    amount: "",
    notes: "",
    deal: "",
    receipt: null as File | null,
  });
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [mileageForm, setMileageForm] = useState({
    begin: "",
    end: "",
    roundTrip: false,
    miles: "",
    deal: "",
  });
  const [mileageLoading, setMileageLoading] = useState(false);
  const [mileageError, setMileageError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setExpenses(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, [user]);

  // Placeholder: Replace with real Google Maps API call
  const calculateMiles = async (begin: string, end: string, roundTrip: boolean) => {
    // Simulate API call
    if (!begin || !end) return 0;
    // Fake: 10 miles one way
    let miles = 10;
    if (roundTrip) miles *= 2;
    return miles;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "receipt") {
      setForm((f) => ({ ...f, receipt: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setMileageForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!user) throw new Error("You must be signed in.");
      let receiptUrl = "";
      if (form.receipt) {
        const storageRef = ref(
          storage,
          `receipts/${user.uid}/${Date.now()}_${form.receipt.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, form.receipt);
        uploadTask.on("state_changed", (snap) => {
          setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100);
        });
        await uploadTask;
        receiptUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        date: form.date,
        category: form.category,
        amount: parseFloat(form.amount),
        notes: form.notes,
        deal: form.deal,
        receiptUrl,
        createdAt: Timestamp.now(),
      });
      setForm({ date: "", category: "", amount: "", notes: "", deal: "", receipt: null });
      setUploadProgress(null);
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleMileageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMileageError("");
    setMileageLoading(true);
    try {
      if (!user) throw new Error("You must be signed in.");
      const miles = await calculateMiles(mileageForm.begin, mileageForm.end, mileageForm.roundTrip);
      const amount = miles * 0.67; // 2024 IRS rate per mile
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        date: new Date().toISOString().slice(0, 10),
        category: "Mileage",
        amount,
        notes: `${miles} miles from ${mileageForm.begin} to ${mileageForm.end}${mileageForm.roundTrip ? " (round trip)" : ""}`,
        deal: mileageForm.deal,
        receiptUrl: "",
        createdAt: Timestamp.now(),
      });
      setMileageForm({ begin: "", end: "", roundTrip: false, miles: "", deal: "" });
    } catch (err: any) {
      setMileageError(err.message || "Failed to add mileage expense");
    } finally {
      setMileageLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "expenses", id));
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Checking authentication...</div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Add Expense</h2>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" name="amount" step="0.01" min="0" value={form.amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
            <input type="file" name="receipt" accept="image/*,application/pdf" onChange={handleChange} className="w-full" />
            {uploadProgress !== null && (
              <div className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress.toFixed(0)}%</div>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag to Deal (optional)</label>
            <input type="text" name="deal" value={form.deal} onChange={handleChange} placeholder="Deal address or ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="sm:col-span-2 flex flex-col items-end gap-2">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Expenses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Notes</th>
                <th className="px-3 py-2 text-left">Receipt</th>
                <th className="px-3 py-2 text-left">Deal</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-3 py-2">{exp.date}</td>
                  <td className="px-3 py-2">{exp.category}</td>
                  <td className="px-3 py-2">${exp.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{exp.notes}</td>
                  <td className="px-3 py-2">{exp.receiptUrl ? <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : "-"}</td>
                  <td className="px-3 py-2">{exp.deal || "-"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="text-red-600 hover:underline disabled:opacity-60"
                    >
                      {deletingId === exp.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-4">No expenses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 