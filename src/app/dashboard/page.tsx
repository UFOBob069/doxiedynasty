"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot, addDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface UserProfile {
  userId: string;
  startOfCommissionYear: Timestamp;
  companySplitPercent: number;
  royaltyPercent: number;
  royaltyCap: number;
  estimatedTaxPercent: number;
}

interface Deal {
  id: string;
  userId?: string;
  address?: string;
  client?: string;
  closeDate?: string;
  gci?: number;
  brokerageSplit?: number;
  referralFee?: number;
  transactionFee?: number;
  netCommission?: number;
  royaltyUsed?: number;
  createdAt?: Timestamp;
  [key: string]: unknown;
}

interface MapboxFeature {
  place_name: string;
  center: [number, number];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

interface MapboxDirectionsResponse {
  routes?: Array<{
    distance: number;
  }>;
}

async function fetchAddressSuggestions(query: string) {
  if (!query || !MAPBOX_TOKEN) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: MapboxResponse = await res.json();
  return data.features?.map((f: MapboxFeature) => f.place_name) || [];
}

async function getMiles(begin: string, end: string) {
  if (!begin || !end || !MAPBOX_TOKEN) return null;
  // Geocode both addresses
  const geocode = async (address: string) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: MapboxResponse = await res.json();
    return data.features?.[0]?.center;
  };
  const beginCoord = await geocode(begin);
  const endCoord = await geocode(end);
  if (!beginCoord || !endCoord) return null;
  // Get driving distance
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${beginCoord[0]},${beginCoord[1]};${endCoord[0]},${endCoord[1]}?access_token=${MAPBOX_TOKEN}&overview=false`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: MapboxDirectionsResponse = await res.json();
  const meters = data.routes?.[0]?.distance;
  if (!meters) return null;
  return meters / 1609.34; // meters to miles
}

interface Expense {
  id: string;
  amount?: number;
  [key: string]: unknown;
}

interface User {
  uid: string;
  [key: string]: unknown;
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

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
  const beginTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const endTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: unknown) => {
      setUser(user as User | null);
      setAuthLoading(false);
      if (!user) router.replace("/signin");
    });
    return () => unsub();
  }, [router]);

  // Load user profile
  useEffect(() => {
    if (!user) return;
    
    const userId = user.uid;
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
    const q = query(collection(db, "deals"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setDeals(snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...(doc.data() as Record<string, unknown>) 
      })));
    });
    return () => unsub();
  }, [user]);

  // Fetch expenses for current user
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  
  // Calculate GCI from deals
  const totalGCI = deals.reduce((sum, deal) => sum + (deal.gci || 0), 0);
  const netIncome = totalGCI - totalExpenses;
  
  // Calculate tax estimates if user profile exists
  const estimatedTaxes = userProfile ? (netIncome * userProfile.estimatedTaxPercent / 100) : 0;
  const takeHomeIncome = netIncome - estimatedTaxes;

  // Calculate royalty cap progress
  const ytdRoyaltyUsage = userProfile ? calculateYtdRoyaltyUsage(deals, userProfile.startOfCommissionYear) : 0;
  const remainingRoyaltyCap = userProfile ? userProfile.royaltyCap - ytdRoyaltyUsage : 0;
  const royaltyCapProgress = userProfile ? (ytdRoyaltyUsage / userProfile.royaltyCap) * 100 : 0;
  const isRoyaltyCapMet = userProfile ? ytdRoyaltyUsage >= userProfile.royaltyCap : false;

  // Calculate real net income over time (last 6 months)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const netIncomeHistory = [];
  
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    // Calculate deals for this month
    const monthDeals = deals.filter(deal => {
      if (!deal.closeDate) return false;
      const dealDate = new Date(deal.closeDate);
      return dealDate >= monthStart && dealDate <= monthEnd;
    });
    
    const monthGCI = monthDeals.reduce((sum, deal) => sum + (deal.gci || 0), 0);
    
    // Calculate expenses for this month
    const monthExpenses = expenses.filter(expense => {
      if (!expense.date || typeof expense.date !== 'string') return false;
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const monthExpenseTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Calculate net income for this month
    const monthNetIncome = monthGCI - monthExpenseTotal;
    netIncomeHistory.push(monthNetIncome);
  }

  // Get month labels for the last 6 months
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    monthLabels.push(months[targetDate.getMonth()]);
  }

  // Find the maximum value for chart scaling (minimum of 1 to avoid division by zero)
  const maxValue = Math.max(...netIncomeHistory, 1);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to calculate miles";
      setMileageError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add mileage expense";
      setMileageError(errorMessage);
    } finally {
      setMileageLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading your dashboard...</div>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
              <p className="text-gray-600 text-lg">Track your deals, expenses, and income at a glance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/settings')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Royalty Cap Tracking Widget */}
        {userProfile && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Royalty Cap Tracker</h2>
                  <p className="text-purple-100">{userProfile.startOfCommissionYear.toDate().getFullYear()} Commission Year</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isRoyaltyCapMet 
                  ? 'bg-green-500/20 text-green-100' 
                  : royaltyCapProgress > 80 
                    ? 'bg-yellow-500/20 text-yellow-100' 
                    : 'bg-blue-500/20 text-blue-100'
              }`}>
                {isRoyaltyCapMet ? 'Cap Met!' : `${royaltyCapProgress.toFixed(1)}% Used`}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">${userProfile.royaltyCap.toLocaleString()}</div>
                <div className="text-purple-100 text-sm">Annual Cap</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">${ytdRoyaltyUsage.toLocaleString()}</div>
                <div className="text-purple-100 text-sm">Used This Year</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">${Math.max(0, remainingRoyaltyCap).toLocaleString()}</div>
                <div className="text-purple-100 text-sm">Remaining</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{royaltyCapProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isRoyaltyCapMet 
                      ? 'bg-green-400' 
                      : royaltyCapProgress > 80 
                        ? 'bg-yellow-400' 
                        : 'bg-white'
                  }`}
                  style={{ width: `${Math.min(100, royaltyCapProgress)}%` }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            <div className={`text-center p-4 rounded-xl ${
              isRoyaltyCapMet 
                ? 'bg-green-500/20 border border-green-400/30' 
                : royaltyCapProgress > 80 
                  ? 'bg-yellow-500/20 border border-yellow-400/30' 
                  : 'bg-blue-500/20 border border-blue-400/30'
            }`}>
              <p className="font-semibold">
                {isRoyaltyCapMet 
                  ? '🎉 Royalty cap met! No more royalty deductions this year.' 
                  : royaltyCapProgress > 80 
                    ? '⚠️ Approaching royalty cap limit' 
                    : '✅ Royalty cap tracking normally'
                }
              </p>
              {!isRoyaltyCapMet && (
                <p className="text-purple-100 text-sm mt-1">
                  {royaltyCapProgress > 80 
                    ? `Only $${remainingRoyaltyCap.toLocaleString()} remaining` 
                    : `${userProfile.royaltyCap - ytdRoyaltyUsage} remaining`
                  }
                </p>
              )}
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Total GCI</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalGCI.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Gross Commission Income</p>
          </div>
          
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
                <span className="text-2xl">📈</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">Net Income</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${netIncome.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">GCI minus expenses</p>
          </div>
        </div>

        {/* Tax Estimates Section */}
        {userProfile && userProfile.estimatedTaxPercent > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧾</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Tax Estimates</h3>
                <p className="text-emerald-100">Based on your {userProfile.estimatedTaxPercent}% tax rate</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">${netIncome.toLocaleString()}</div>
                <div className="text-emerald-100 text-sm">Net Income</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">-${estimatedTaxes.toLocaleString()}</div>
                <div className="text-emerald-100 text-sm">Estimated Taxes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">${takeHomeIncome.toLocaleString()}</div>
                <div className="text-emerald-100 text-sm">Take-Home Estimate</div>
              </div>
            </div>
            
            <p className="text-emerald-100 text-sm mt-4 text-center">
              Tax estimates are based on your settings. Consult with a tax professional for actual tax planning.
            </p>
          </div>
        )}

        {/* Net Income Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Net Income Over Time</h3>
                <p className="text-gray-500 text-sm">Last 6 months performance</p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Monthly View</span>
          </div>
          
          {/* Enhanced bar chart */}
          <div className="flex items-end h-40 mt-4 space-x-3">
            {netIncomeHistory.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                    val >= 0 
                      ? 'bg-gradient-to-t from-green-500 to-green-400' 
                      : 'bg-gradient-to-t from-red-500 to-red-400'
                  }`}
                  style={{ 
                    height: `${Math.abs(val / maxValue) * 100}%`,
                    minHeight: val !== 0 ? '8px' : '0px'
                  }}
                ></div>
                <span className="text-xs mt-2 text-gray-500 font-medium">{monthLabels[idx]}</span>
                <span className={`text-xs mt-1 font-bold ${
                  val >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <span className="text-sm text-gray-500 font-medium">6-Month Total</span>
              <div className={`text-lg font-bold mt-1 ${
                netIncomeHistory.reduce((sum, val) => sum + val, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${netIncomeHistory.reduce((sum, val) => sum + val, 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500 font-medium">Best Month</span>
              <div className="text-lg font-bold mt-1 text-green-600">
                ${Math.max(...netIncomeHistory).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500 font-medium">Average/Month</span>
              <div className={`text-lg font-bold mt-1 ${
                netIncomeHistory.reduce((sum, val) => sum + val, 0) / 6 >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${(netIncomeHistory.reduce((sum, val) => sum + val, 0) / 6).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            onClick={() => router.push('/deals')}
          >
            <div className="flex items-center justify-center gap-2">
              <span>➕</span>
              <span>Add New Deal</span>
            </div>
          </button>
          <button
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            onClick={() => router.push('/expenses')}
          >
            <div className="flex items-center justify-center gap-2">
              <span>💳</span>
              <span>Add Expense</span>
            </div>
          </button>
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            onClick={() => setMileageModalOpen(true)}
          >
            <div className="flex items-center justify-center gap-2">
              <span>🚗</span>
              <span>Log Mileage</span>
            </div>
          </button>
        </div>

        {/* Mileage Modal */}
        {mileageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setMileageModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Log Mileage</h2>
                  <p className="text-gray-500 text-sm">Track your business travel</p>
                </div>
              </div>
              
              <form className="space-y-4" onSubmit={handleMileageSubmit} autoComplete="off">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Begin Address</label>
                  <input 
                    type="text" 
                    name="begin" 
                    value={mileageForm.begin} 
                    onChange={handleMileageChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    required 
                    autoComplete="off" 
                    placeholder="Enter starting address"
                  />
                  {beginSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-200 rounded-xl w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                      {beginSuggestions.map((s, i) => (
                        <li key={i} className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => selectBegin(s)}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Address</label>
                  <input 
                    type="text" 
                    name="end" 
                    value={mileageForm.end} 
                    onChange={handleMileageChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    required 
                    autoComplete="off" 
                    placeholder="Enter destination address"
                  />
                  {endSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-200 rounded-xl w-full mt-1 shadow-lg max-h-40 overflow-y-auto">
                      {endSuggestions.map((s, i) => (
                        <li key={i} className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => selectEnd(s)}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    name="roundTrip" 
                    checked={mileageForm.roundTrip} 
                    onChange={handleMileageChange} 
                    id="roundTrip" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="roundTrip" className="text-sm font-medium text-gray-700">Round Trip</label>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cost per Mile</label>
                  <input 
                    type="number" 
                    name="costPerMile" 
                    value={mileageForm.costPerMile} 
                    onChange={handleMileageChange} 
                    step="0.01" 
                    min="0" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tag to Deal (optional)</label>
                  <input 
                    type="text" 
                    name="deal" 
                    value={mileageForm.deal} 
                    onChange={handleMileageChange} 
                    placeholder="Deal address or ID" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
                
                <div className="space-y-3">
                  {mileageError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {mileageError}
                    </div>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={handleCalculateMiles} 
                    disabled={mileageLoading || !mileageForm.begin || !mileageForm.end} 
                    className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {mileageLoading ? "Calculating..." : "Calculate Miles"}
                  </button>
                  
                  {calculatedMiles !== null && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center font-semibold">
                      {calculatedMiles.toFixed(2)} miles
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={mileageLoading || !calculatedMiles} 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-1"
                  >
                    {mileageLoading ? "Adding..." : "Add Mileage Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 