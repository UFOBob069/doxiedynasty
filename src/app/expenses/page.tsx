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
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
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
  const [expenses, setExpenses] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
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
  const [user, setUser] = useState<unknown>(null);
  const router = useRouter();
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
      where("userId", "==", (user as { uid: string }).uid),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setExpenses(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as unknown as { name: string; value: string; files: FileList };
    if (name === "receipt") {
      setForm((f) => ({ ...f, receipt: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
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
          `receipts/${(user as { uid: string }).uid}/${Date.now()}_${form.receipt.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, form.receipt);
        uploadTask.on("state_changed", (snap) => {
          setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100);
        });
        await uploadTask;
        receiptUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "expenses"), {
        userId: (user as { uid: string }).uid,
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add expense";
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  function safeDisplay(val: unknown): string {
    if (typeof val === 'number') return val.toLocaleString();
    if (typeof val === 'string') return val;
    return '';
  }

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
                  <td className="px-3 py-2">{safeDisplay(exp.date)}</td>
                  <td className="px-3 py-2">{safeDisplay(exp.category)}</td>
                  <td className="px-3 py-2">${typeof exp.amount === 'number' ? exp.amount.toFixed(2) : safeDisplay(exp.amount)}</td>
                  <td className="px-3 py-2">{safeDisplay(exp.notes)}</td>
                  <td className="px-3 py-2">{exp.receiptUrl ? <a href={exp.receiptUrl as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : "-"}</td>
                  <td className="px-3 py-2">{safeDisplay(exp.deal) || "-"}</td>
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