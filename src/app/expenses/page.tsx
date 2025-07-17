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

// Utility function to convert array of objects to CSV
function arrayToCSV(items: Record<string, unknown>[]): string {
  if (!items.length) return '';
  const replacer = (key: string, value: unknown) => (value === null || value === undefined ? '' : value);
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','),
    ...items.map(row =>
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    ),
  ].join('\r\n');
  return csv;
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

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

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount as number || 0), 0);
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category as string || 'Other';
    acc[category] = (acc[category] || 0) + (exp.amount as number || 0);
    return acc;
  }, {} as Record<string, number>);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Checking authentication...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Tracking</h1>
              <p className="text-gray-600 text-lg">Manage your business expenses and receipts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => downloadCSV(expenses, 'expenses.csv')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                📥 Download CSV
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <span className="text-red-600 text-sm font-medium">Total Expenses</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalExpenses.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">All tracked expenses</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">Total Entries</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{expenses.length}</div>
            <p className="text-gray-500 text-sm">Expense records</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Categories</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{Object.keys(expensesByCategory).length}</div>
            <p className="text-gray-500 text-sm">Active categories</p>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Expense</h2>
              <p className="text-gray-500 text-sm">Track your business expenses with receipts</p>
            </div>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                name="date" 
                value={form.date} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <input 
                type="number" 
                name="amount" 
                step="0.01" 
                min="0" 
                value={form.amount} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <input 
                type="text" 
                name="notes" 
                value={form.notes} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="Brief description"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt (optional)</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input 
                  type="file" 
                  name="receipt" 
                  accept="image/*,application/pdf" 
                  onChange={handleChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="space-y-2 pointer-events-none">
                  <span className="text-4xl">📄</span>
                  <p className="text-gray-600">Click to upload receipt</p>
                  <p className="text-sm text-gray-500">Supports images and PDFs</p>
                </div>
              </div>
              {uploadProgress !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tag to Deal (optional)</label>
              <input 
                type="text" 
                name="deal" 
                value={form.deal} 
                onChange={handleChange} 
                placeholder="Deal address or ID" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              />
            </div>
            
            <div className="md:col-span-2 flex flex-col items-end gap-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm w-full">
                  {error}
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expense History</h2>
              <p className="text-gray-500 text-sm">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} tracked</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Receipt</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Deal</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{safeDisplay(exp.date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {safeDisplay(exp.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600">
                      ${typeof exp.amount === 'number' ? exp.amount.toFixed(2) : safeDisplay(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{safeDisplay(exp.notes)}</td>
                    <td className="px-4 py-3">
                      {exp.receiptUrl ? (
                        <a 
                          href={exp.receiptUrl as string} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{safeDisplay(exp.deal) || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {deletingId === exp.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📊</span>
                        <p className="text-lg font-medium">No expenses yet</p>
                        <p className="text-sm">Add your first expense to get started!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 