"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

interface UserProfile {
  userId: string;
  startOfCommissionYear: Timestamp;
  companySplitPercent: number;
  royaltyPercent: number;
  royaltyCap: number;
  estimatedTaxPercent: number;
}

export default function SettingsPage() {
  const [user, setUser] = useState<unknown>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile>({
    userId: "",
    startOfCommissionYear: Timestamp.fromDate(new Date(new Date().getFullYear(), 0, 1)), // January 1st of current year
    companySplitPercent: 30,
    royaltyPercent: 6,
    royaltyCap: 3000,
    estimatedTaxPercent: 25,
  });

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
        setProfile(data);
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          userId,
          startOfCommissionYear: Timestamp.fromDate(new Date(new Date().getFullYear(), 0, 1)),
          companySplitPercent: 30,
          royaltyPercent: 6,
          royaltyCap: 3000,
          estimatedTaxPercent: 25,
        };
        setProfile(defaultProfile);
      }
    });

    return () => unsub();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'date' 
        ? Timestamp.fromDate(new Date(value))
        : type === 'number' 
          ? parseFloat(value) || 0 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const userId = (user as { uid: string }).uid;
      const profileRef = doc(db, "userProfiles", userId);
      
      await setDoc(profileRef, {
        ...profile,
        userId,
        updatedAt: Timestamp.now(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Loading settings...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-gray-600 text-lg">Configure your commission and tax preferences</p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Commission Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🛠️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Commission Settings</h2>
                <p className="text-gray-500 text-sm">Configure your commission structure and royalty tracking</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start of Commission Year
                </label>
                <input
                  type="date"
                  name="startOfCommissionYear"
                  value={profile.startOfCommissionYear.toDate().toISOString().split('T')[0]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Used for royalty cap tracking and YTD calculations
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Company Split %
                </label>
                <input
                  type="number"
                  name="companySplitPercent"
                  value={profile.companySplitPercent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Default percentage your brokerage takes from each deal
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Associate Royalty %
                </label>
                <input
                  type="number"
                  name="royaltyPercent"
                  value={profile.royaltyPercent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="6"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Percentage of GCI that goes toward your royalty cap
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Royalty Cap
                </label>
                <input
                  type="number"
                  name="royaltyCap"
                  value={profile.royaltyCap}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="3000"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Maximum annual amount for royalty deductions
                </p>
              </div>
            </div>
          </div>

          {/* Tax Estimator Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧾</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tax Estimator Settings</h2>
                <p className="text-gray-500 text-sm">Configure tax estimates for take-home income calculations</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimated Tax Rate %
              </label>
              <input
                type="number"
                name="estimatedTaxPercent"
                value={profile.estimatedTaxPercent}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                placeholder="25"
              />
              <p className="text-xs text-gray-500 mt-2">
                Used for take-home income estimates. Consult with a tax professional for actual tax planning.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <p className="text-green-600 text-sm font-medium">Settings saved successfully!</p>
              </div>
            </div>
          )}
        </form>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="text-xl font-bold">Need Help?</h3>
          </div>
          <p className="text-blue-100 mb-4">
            These settings control how your commissions and taxes are calculated throughout the app. 
            Make sure to update them whenever your commission structure changes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Commission Year</h4>
              <p className="text-blue-100">Set this to track your royalty cap from the correct start date.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tax Estimates</h4>
              <p className="text-blue-100">Used for take-home income projections on your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 