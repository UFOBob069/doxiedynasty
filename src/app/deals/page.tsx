"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { collection, addDoc, query, where, onSnapshot, Timestamp, orderBy, QuerySnapshot, DocumentData, QueryDocumentSnapshot, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface UserProfile {
  userId: string;
  startOfCommissionYear: Timestamp;
  commissionType?: 'percentage' | 'fixed';
  commissionPercent: number | string; // Agent's commission percentage on total deal
  companySplitPercent: number | string; // Company's percentage
  companySplitCap: number | string; // Company split cap
  royaltyPercent: number | string; // Royalty percentage
  royaltyCap: number | string; // Royalty cap
  estimatedTaxPercent: number | string;
  fixedCommissionAmount?: number | string;
}

interface Deal {
  id: string;
  userId?: string;
  address?: string;
  client?: string;
  closeDate?: string;
  totalDealAmount?: number; // Total deal amount
  commissionPercent?: number; // Agent's commission percentage
  agentCommission?: number; // Agent's commission amount
  companySplit?: number; // Company split amount
  royaltyUsed?: number; // Royalty amount
  grossIncome?: number; // Gross before taxes
  estimatedTaxes?: number; // Estimated taxes
  netIncome?: number; // Take-home amount
  referralFee?: number; // Optional referral fee
  transactionFee?: number; // Optional transaction fee
  createdAt?: Timestamp;
  [key: string]: unknown;
}

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

function safeNumber(val: number | string | undefined): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  return 0;
}

// Helper function to calculate YTD royalty usage
function calculateYtdRoyaltyUsage(deals: Deal[], startOfCommissionYear: Timestamp): number {
  const startDate = startOfCommissionYear.toDate();
  const endDate = new Date();
  
  return deals
    .filter(deal => {
      const dealDate = new Date(deal.closeDate || "");
      return dealDate >= startDate && dealDate <= endDate;
    })
    .reduce((sum, deal) => sum + (deal.royaltyUsed || 0), 0);
}

// Helper function to calculate YTD company split usage
function calculateYtdCompanySplitUsage(deals: Deal[], startOfCommissionYear: Timestamp): number {
  const startDate = startOfCommissionYear.toDate();
  const endDate = new Date();
  
  return deals
    .filter(deal => {
      const dealDate = new Date(deal.closeDate || "");
      return dealDate >= startDate && dealDate <= endDate;
    })
    .reduce((sum, deal) => sum + (deal.companySplit || 0), 0);
}

// Step-by-step commission calculation with detailed breakdown
function calculateDealBreakdown(
  totalDealAmount: number,
  userProfile: UserProfile,
  ytdRoyaltyUsage: number,
  ytdCompanySplitUsage: number,
  referralFee: number = 0,
  transactionFee: number = 0
): {
  steps: {
    step1: { label: string; amount: number; description: string };
    step2: { label: string; amount: number; description: string };
    step3: { label: string; amount: number; description: string };
    step4: { label: string; amount: number; description: string };
    step5: { label: string; amount: number; description: string };
  };
  agentCommission: number;
  companySplit: number;
  royaltyUsed: number;
  grossIncome: number;
  estimatedTaxes: number;
  netIncome: number;
} {
  const commissionType = userProfile.commissionType || 'percentage';
  
  if (commissionType === 'fixed') {
    // Fixed amount commission structure
    const fixedAmount = safeNumber(userProfile.fixedCommissionAmount);
    const estimatedTaxes = fixedAmount * (safeNumber(userProfile.estimatedTaxPercent) / 100);
    const netIncome = fixedAmount - estimatedTaxes;
    
    return {
      steps: {
        step1: {
          label: "Property Sale Price",
          amount: totalDealAmount,
          description: `Property sold for $${totalDealAmount.toLocaleString()}`
        },
        step2: {
          label: "Fixed Commission",
          amount: fixedAmount,
          description: `Flat commission of $${fixedAmount.toLocaleString()} per deal`
        },
        step3: {
          label: "Gross Income",
          amount: fixedAmount,
          description: "No company split or royalty with fixed commission"
        },
        step4: {
          label: "Estimated Taxes",
          amount: estimatedTaxes,
          description: `${safeNumber(userProfile.estimatedTaxPercent)}% of gross income`
        },
        step5: {
          label: "Net Take-Home",
          amount: netIncome,
          description: "Gross income minus taxes"
        }
      },
      agentCommission: fixedAmount,
      companySplit: 0,
      royaltyUsed: 0,
      grossIncome: fixedAmount,
      estimatedTaxes,
      netIncome
    };
  } else {
    // Percentage-based commission structure
    const commissionPercent = safeNumber(userProfile.commissionPercent);
    const companySplitPercent = safeNumber(userProfile.companySplitPercent);
    const companySplitCap = safeNumber(userProfile.companySplitCap);
    const royaltyPercent = safeNumber(userProfile.royaltyPercent);
    const royaltyCap = safeNumber(userProfile.royaltyCap);
    const estimatedTaxPercent = safeNumber(userProfile.estimatedTaxPercent);
    
    // Step 1: Calculate total commission from sale price
    const totalCommission = totalDealAmount * (commissionPercent / 100);
    
    // Step 2: Calculate company split (capped)
    const remainingCompanyCap = companySplitCap - ytdCompanySplitUsage;
    const companySplit = Math.max(0, Math.min(totalCommission * (companySplitPercent / 100), remainingCompanyCap));
    
    // Step 3: Calculate royalty (capped)
    const remainingRoyaltyCap = royaltyCap - ytdRoyaltyUsage;
    const royaltyUsed = Math.max(0, Math.min(totalCommission * (royaltyPercent / 100), remainingRoyaltyCap));
    
    // Step 4: Calculate gross income
    const grossIncome = totalCommission - companySplit - royaltyUsed - referralFee - transactionFee;
    
    // Step 5: Calculate taxes and net
    const estimatedTaxes = grossIncome * (estimatedTaxPercent / 100);
    const netIncome = grossIncome - estimatedTaxes;
    
    return {
      steps: {
        step1: {
          label: "Property Sale Price",
          amount: totalDealAmount,
          description: `Property sold for $${totalDealAmount.toLocaleString()}`
        },
        step2: {
          label: "Total Commission",
          amount: totalCommission,
          description: `${commissionPercent}% of sale price`
        },
        step3: {
          label: "After Company Split & Royalty",
          amount: grossIncome,
          description: `Minus company split ($${companySplit.toLocaleString()}) and royalty ($${royaltyUsed.toLocaleString()})`
        },
        step4: {
          label: "Estimated Taxes",
          amount: estimatedTaxes,
          description: `${estimatedTaxPercent}% of gross income`
        },
        step5: {
          label: "Net Take-Home",
          amount: netIncome,
          description: "Gross income minus taxes"
        }
      },
      agentCommission: totalCommission,
      companySplit,
      royaltyUsed,
      grossIncome,
      estimatedTaxes,
      netIncome
    };
  }
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    address: "",
    client: "",
    closeDate: "",
    totalDealAmount: "",
    commissionPercent: "",
    referralFee: "",
    transactionFee: "",
  });
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<{
    steps: {
      step1: { label: string; amount: number; description: string };
      step2: { label: string; amount: number; description: string };
      step3: { label: string; amount: number; description: string };
      step4: { label: string; amount: number; description: string };
      step5: { label: string; amount: number; description: string };
    };
    agentCommission: number;
    companySplit: number;
    royaltyUsed: number;
    grossIncome: number;
    estimatedTaxes: number;
    netIncome: number;
  } | null>(null);
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

  // Load user profile
  useEffect(() => {
    if (!user) return;
    
    const userId = (user as { uid: string }).uid;
    const profileRef = doc(db, "userProfiles", userId);
    
    const unsub = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setUserProfile(data);
      }
    });

    return () => unsub();
  }, [user]);

  // Fetch deals for current user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "deals"), where("userId", "==", (user as { uid: string }).uid), orderBy("closeDate", "desc"));
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      setDeals(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
        id: doc.id, 
        ...(doc.data() as Record<string, unknown>) 
      })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Calculate breakdown when user profile loads or form values change
  useEffect(() => {
    if (!userProfile || !form.totalDealAmount) return;
    
    const totalDealAmount = parseFloat(form.totalDealAmount) || 0;
    if (totalDealAmount > 0) {
      const ytdRoyaltyUsage = calculateYtdRoyaltyUsage(deals, userProfile.startOfCommissionYear);
      const ytdCompanySplitUsage = calculateYtdCompanySplitUsage(deals, userProfile.startOfCommissionYear);
      const referralFee = parseFloat(form.referralFee) || 0;
      const transactionFee = parseFloat(form.transactionFee) || 0;
      
      const breakdownResult = calculateDealBreakdown(
        totalDealAmount,
        userProfile,
        ytdRoyaltyUsage,
        ytdCompanySplitUsage,
        referralFee,
        transactionFee
      );
      setBreakdown(breakdownResult);
    } else {
      setBreakdown(null);
    }
  }, [userProfile, form.totalDealAmount, form.referralFee, form.transactionFee, deals]);

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
      if (!user || !userProfile) throw new Error("You must be signed in and have profile settings configured.");
      
      const totalDealAmount = parseFloat(form.totalDealAmount) || 0;
      const commissionPercent = parseFloat(form.commissionPercent) || safeNumber(userProfile.commissionPercent);
      const referralFee = parseFloat(form.referralFee) || 0;
      const transactionFee = parseFloat(form.transactionFee) || 0;
      
      // Calculate YTD usage for both caps
      const ytdRoyaltyUsage = calculateYtdRoyaltyUsage(deals, userProfile.startOfCommissionYear);
      const ytdCompanySplitUsage = calculateYtdCompanySplitUsage(deals, userProfile.startOfCommissionYear);
      
      // Calculate deal breakdown
      const breakdown = calculateDealBreakdown(
        totalDealAmount,
        userProfile,
        ytdRoyaltyUsage,
        ytdCompanySplitUsage,
        referralFee,
        transactionFee
      );

      await addDoc(collection(db, "deals"), {
        userId: (user as { uid: string }).uid,
        address: form.address,
        client: form.client,
        closeDate: form.closeDate,
        totalDealAmount,
        commissionPercent,
        agentCommission: breakdown.agentCommission,
        companySplit: breakdown.companySplit,
        royaltyUsed: breakdown.royaltyUsed,
        grossIncome: breakdown.grossIncome,
        estimatedTaxes: breakdown.estimatedTaxes,
        netIncome: breakdown.netIncome,
        referralFee,
        transactionFee,
        createdAt: Timestamp.now(),
      });
      setForm({ address: "", client: "", closeDate: "", totalDealAmount: "", commissionPercent: "", referralFee: "", transactionFee: "" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add deal";
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this deal? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "deals", id));
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate totals
  const totalDealAmount = deals.reduce((sum, deal) => sum + (deal.totalDealAmount || 0), 0);
  const totalAgentCommission = deals.reduce((sum, deal) => sum + (deal.agentCommission || 0), 0);
  const totalNetIncome = deals.reduce((sum, deal) => sum + (deal.netIncome || 0), 0);
  
  const ytdRoyaltyUsage = userProfile ? calculateYtdRoyaltyUsage(deals, userProfile.startOfCommissionYear) : 0;
  const ytdCompanySplitUsage = userProfile ? calculateYtdCompanySplitUsage(deals, userProfile.startOfCommissionYear) : 0;
  
  const remainingRoyaltyCap = userProfile ? safeNumber(userProfile.royaltyCap) - ytdRoyaltyUsage : 0;
  const remainingCompanyCap = userProfile ? safeNumber(userProfile.companySplitCap) - ytdCompanySplitUsage : 0;

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading your deals...</div>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Deals Management</h1>
              <p className="text-gray-600 text-lg">Track your real estate transactions and commissions</p>
            </div>
            <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Total Deals</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalDealAmount.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Total deal volume</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">Agent Commission</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalAgentCommission.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Your commission total</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <span className="text-purple-600 text-sm font-medium">Take-Home</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalNetIncome.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Net after taxes</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <span className="text-orange-600 text-sm font-medium">Caps Remaining</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${(remainingRoyaltyCap + remainingCompanyCap).toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Royalty + Company</p>
          </div>
        </div>

        {/* Add Deal Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Deal</h2>
              <p className="text-gray-500 text-sm">Enter deal details and see automatic breakdown</p>
            </div>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address</label>
              <input 
                type="text" 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
                autoComplete="off" 
                placeholder="Enter property address"
              />
              {addressSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-xl w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {addressSuggestions.map((s, i) => (
                    <li key={i} className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => selectAddress(s)}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
              <input 
                type="text" 
                name="client" 
                value={form.client} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
                placeholder="Enter client name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Close Date</label>
              <input 
                type="date" 
                name="closeDate" 
                value={form.closeDate} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Deal Amount</label>
              <input 
                type="number" 
                name="totalDealAmount" 
                value={form.totalDealAmount} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                required 
                placeholder="0.00"
              />
            </div>
            
            {userProfile?.commissionType === 'fixed' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fixed Commission</label>
                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-600">
                  ${safeNumber(userProfile.fixedCommissionAmount).toLocaleString()} per deal
                </div>
                <p className="text-xs text-gray-500 mt-1">Fixed amount from your settings</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Commission %</label>
                <input 
                  type="number" 
                  name="commissionPercent" 
                  value={form.commissionPercent || userProfile?.commissionPercent || ""} 
                  onChange={handleChange} 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder={userProfile?.commissionPercent?.toString()}
                />
                <p className="text-xs text-gray-500 mt-1">Default: {userProfile?.commissionPercent}%</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Referral Fee (optional)</label>
              <input 
                type="number" 
                name="referralFee" 
                value={form.referralFee} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Fee (optional)</label>
              <input 
                type="number" 
                name="transactionFee" 
                value={form.transactionFee} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                placeholder="0.00"
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Add Deal
              </button>
            </div>
          </form>
          
          {/* Step-by-Step Breakdown */}
          {breakdown ? (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🧮</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Commission Breakdown</h3>
                  <p className="text-gray-500 text-sm">See exactly how your commission is calculated</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(breakdown.steps).map(([key, step]: [string, { label: string; amount: number; description: string }]) => (
                  <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">{step.label}</div>
                    <div className="text-lg font-bold text-gray-900 mb-2">${step.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">{step.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-emerald-800">Final Take-Home</div>
                    <div className="text-xs text-emerald-600">After all deductions and taxes</div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">${breakdown.netIncome.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-2">Enter a deal amount above to see the commission breakdown</div>
                <div className="text-xs text-gray-400">The breakdown will show step-by-step how your commission is calculated</div>
              </div>
            </div>
          )}
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Deals</h2>
              <p className="text-gray-500 text-sm">{deals.length} deal{deals.length !== 1 ? 's' : ''} tracked</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Address</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Deal</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Agent Commission</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Company Split</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Royalty</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Net Income</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{String(deal.address ?? "")}</td>
                    <td className="px-4 py-3">{String(deal.client ?? "")}</td>
                    <td className="px-4 py-3 text-gray-600">{String(deal.closeDate ?? "")}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">${safeDisplay(deal.totalDealAmount)}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">${safeDisplay(deal.agentCommission)}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">${safeDisplay(deal.companySplit)}</td>
                    <td className="px-4 py-3 font-semibold text-purple-600">${safeDisplay(deal.royaltyUsed)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">${safeDisplay(deal.netIncome)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(deal.id)}
                        disabled={deletingId === deal.id}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          deletingId === deal.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700'
                        }`}
                      >
                        {deletingId === deal.id ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </span>
                        ) : (
                          '🗑️ Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📋</span>
                        <p className="text-lg font-medium">No deals yet</p>
                        <p className="text-sm">Add your first deal to get started!</p>
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