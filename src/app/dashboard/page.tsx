"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot, Timestamp, orderBy, QuerySnapshot, DocumentData, QueryDocumentSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  userId: string;
  startOfCommissionYear: Timestamp;
  commissionPercent: number | string; // Agent's commission percentage on total deal
  companySplitPercent: number | string; // Company's percentage
  companySplitCap: number | string; // Company split cap
  royaltyPercent: number | string; // Royalty percentage
  royaltyCap: number | string; // Royalty cap
  estimatedTaxPercent: number | string;
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

interface Expense {
  id: string;
  userId?: string;
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  createdAt?: Timestamp;
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

// Helper function to calculate monthly net income
function calculateMonthlyNetIncome(deals: Deal[], expenses: Expense[], months: number = 6): Array<{ month: string; netIncome: number }> {
  const monthlyData: { [key: string]: number } = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[monthKey] = 0;
  }
  
  // Add deal income
  deals.forEach(deal => {
    if (deal.closeDate) {
      const dealDate = new Date(deal.closeDate);
      const monthKey = dealDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += deal.netIncome || 0;
      }
    }
  });
  
  // Subtract expenses
  expenses.forEach(expense => {
    if (expense.date) {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] -= expense.amount || 0;
      }
    }
  });
  
  return Object.entries(monthlyData).map(([month, netIncome]) => ({ month, netIncome }));
}

function safeNumber(val: number | string | undefined): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  return 0;
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState<unknown>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

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

  // Fetch expenses for current user
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "expenses"), where("userId", "==", (user as { uid: string }).uid), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      setExpenses(snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ 
        id: doc.id, 
        ...(doc.data() as Record<string, unknown>) 
      })));
    });
    return () => unsub();
  }, [user]);

  // Calculate totals
  const totalDealAmount = deals.reduce((sum, deal) => sum + (deal.totalDealAmount || 0), 0);
  const totalAgentCommission = deals.reduce((sum, deal) => sum + (deal.agentCommission || 0), 0);
  const totalNetIncome = deals.reduce((sum, deal) => sum + (deal.netIncome || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  // Calculate YTD usage for both caps
  const ytdRoyaltyUsage = userProfile ? calculateYtdRoyaltyUsage(deals, userProfile.startOfCommissionYear) : 0;
  const ytdCompanySplitUsage = userProfile ? calculateYtdCompanySplitUsage(deals, userProfile.startOfCommissionYear) : 0;
  
  const remainingRoyaltyCap = userProfile ? safeNumber(userProfile.royaltyCap) - ytdRoyaltyUsage : 0;
  const remainingCompanyCap = userProfile ? safeNumber(userProfile.companySplitCap) - ytdCompanySplitUsage : 0;
  
  const royaltyCapPercentage = userProfile ? (ytdRoyaltyUsage / safeNumber(userProfile.royaltyCap)) * 100 : 0;
  const companyCapPercentage = userProfile ? (ytdCompanySplitUsage / safeNumber(userProfile.companySplitCap)) * 100 : 0;
  
  // Calculate monthly net income for chart
  const monthlyNetIncome = calculateMonthlyNetIncome(deals, expenses, 6);
  const averageMonthlyNet = monthlyNetIncome.length > 0 
    ? monthlyNetIncome.reduce((sum, month) => sum + month.netIncome, 0) / monthlyNetIncome.length 
    : 0;
  const bestMonth = monthlyNetIncome.length > 0 
    ? Math.max(...monthlyNetIncome.map(month => month.netIncome)) 
    : 0;

  // Check if settings are incomplete
  const isSettingsIncomplete = !userProfile || 
    !safeNumber(userProfile.commissionPercent) || 
    !safeNumber(userProfile.companySplitPercent) || 
    !safeNumber(userProfile.companySplitCap) || 
    !safeNumber(userProfile.royaltyPercent) || 
    !safeNumber(userProfile.royaltyCap) || 
    !safeNumber(userProfile.estimatedTaxPercent) ||
    !userProfile.startOfCommissionYear;

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
              <p className="text-gray-600 text-lg">Track your real estate income and expenses</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/deals')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                📋 Deals
              </button>
              <button
                onClick={() => router.push('/expenses')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                💰 Expenses
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Settings Completion Notification */}
        {isSettingsIncomplete && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-2">Complete Your Settings</h3>
                <p className="text-amber-700 mb-4">
                  To get the most out of your dashboard and ensure accurate commission calculations, 
                  please complete your profile settings including commission percentages, caps, and tax rates.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {!safeNumber(userProfile?.commissionPercent) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Commission %</span>
                  )}
                  {!safeNumber(userProfile?.companySplitPercent) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Company Split %</span>
                  )}
                  {!safeNumber(userProfile?.companySplitCap) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Company Cap</span>
                  )}
                  {!safeNumber(userProfile?.royaltyPercent) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Royalty %</span>
                  )}
                  {!safeNumber(userProfile?.royaltyCap) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Royalty Cap</span>
                  )}
                  {!safeNumber(userProfile?.estimatedTaxPercent) && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Tax Rate</span>
                  )}
                  {!userProfile?.startOfCommissionYear && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Commission Year</span>
                  )}
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Complete Settings Now
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <span className="text-red-600 text-sm font-medium">Expenses</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">${totalExpenses.toLocaleString()}</div>
            <p className="text-gray-500 text-sm">Total expenses</p>
          </div>
        </div>

        {/* Cap Tracking Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Royalty Cap Widget */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Royalty Cap</h3>
                  <p className="text-gray-500 text-sm">Annual royalty tracking</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${ytdRoyaltyUsage.toLocaleString()}</div>
                <div className="text-sm text-gray-500">of ${safeNumber(userProfile?.royaltyCap).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{royaltyCapPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    royaltyCapPercentage >= 90 ? 'bg-red-500' : 
                    royaltyCapPercentage >= 75 ? 'bg-orange-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(royaltyCapPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className={`font-medium ${
                remainingRoyaltyCap <= 0 ? 'text-red-600' : 
                remainingRoyaltyCap < safeNumber(userProfile?.royaltyCap) * 0.1 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {remainingRoyaltyCap <= 0 ? 'Cap reached!' : `$${remainingRoyaltyCap.toLocaleString()} remaining`}
              </span>
              <span className="text-gray-500">
                {userProfile?.startOfCommissionYear?.toDate().toLocaleDateString() || 'Not set'} - {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Company Split Cap Widget */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Company Split Cap</h3>
                  <p className="text-gray-500 text-sm">Annual company split tracking</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${ytdCompanySplitUsage.toLocaleString()}</div>
                <div className="text-sm text-gray-500">of ${safeNumber(userProfile?.companySplitCap).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{companyCapPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    companyCapPercentage >= 90 ? 'bg-red-500' : 
                    companyCapPercentage >= 75 ? 'bg-orange-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(companyCapPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className={`font-medium ${
                remainingCompanyCap <= 0 ? 'text-red-600' : 
                remainingCompanyCap < safeNumber(userProfile?.companySplitCap) * 0.1 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {remainingCompanyCap <= 0 ? 'Cap reached!' : `$${remainingCompanyCap.toLocaleString()} remaining`}
              </span>
              <span className="text-gray-500">
                {userProfile?.startOfCommissionYear?.toDate().toLocaleDateString() || 'Not set'} - {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Net Income Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Net Income Over Time</h2>
              <p className="text-gray-500 text-sm">Monthly net income (deals - expenses)</p>
            </div>
          </div>
          
          {monthlyNetIncome.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-emerald-600">${averageMonthlyNet.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Average Monthly Net</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">${bestMonth.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Best Month</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">${(totalNetIncome - totalExpenses).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Net (All Time)</div>
                </div>
              </div>
              
              <div className="space-y-4">
                {monthlyNetIncome.map((month) => {
                  const maxValue = Math.max(...monthlyNetIncome.map(m => Math.abs(m.netIncome || 0)), 1);
                  return (
                    <div key={month.month} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium text-gray-600">{month.month}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${
                            (month.netIncome || 0) >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(month.netIncome || 0) / maxValue * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className={`w-24 text-right font-semibold ${
                        (month.netIncome || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        ${(month.netIncome || 0).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📊</span>
                <p className="text-lg font-medium">No data yet</p>
                <p className="text-sm">Add some deals and expenses to see your net income chart</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Deals */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recent Deals</h3>
            </div>
            <div className="space-y-3">
              {deals.slice(0, 5).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">{String(deal.address ?? "").split(',')[0]}</div>
                    <div className="text-sm text-gray-500">{String(deal.closeDate ?? "")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">${(deal.netIncome || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Net Income</div>
                  </div>
                </div>
              ))}
              {deals.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  <p className="text-sm">No deals yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">💸</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Recent Expenses</h3>
            </div>
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">{String(expense.description ?? "")}</div>
                    <div className="text-sm text-gray-500">{String(expense.date ?? "")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-${(expense.amount || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{String(expense.category ?? "")}</div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  <p className="text-sm">No expenses yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 