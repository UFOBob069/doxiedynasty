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
  commissionType?: 'percentage' | 'fixed';
  companySplitPercent: number | string; // Company's percentage
  companySplitCap: number | string; // Company split cap
  royaltyPercent: number | string; // Royalty percentage
  royaltyCap: number | string; // Royalty cap
  estimatedTaxPercent: number | string;
  fixedCommissionAmount?: number | string;
  // Personal/Business Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  licenseNumber?: string;
  zipCode?: string;
  state?: string;
  // Financial Tracking
  monthlyGoal?: number | string;
  annualGoal?: number | string;
  emergencyFund?: number | string;
  retirementContribution?: number | string;
  // Additional Settings
  currency?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    capAlerts?: boolean;
  };
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
    commissionType: 'percentage',
    companySplitPercent: 30, // Company gets 30% of total deal
    companySplitCap: 5000, // Company cap at $5,000
    royaltyPercent: 6, // 6% royalty
    royaltyCap: 3000, // $3,000 royalty cap
    estimatedTaxPercent: 25,
    fixedCommissionAmount: 0,
    // Personal/Business Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    licenseNumber: "",
    zipCode: "",
    state: "",
    // Financial Tracking
    monthlyGoal: 0,
    annualGoal: 0,
    emergencyFund: 0,
    retirementContribution: 0,
    // Additional Settings
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: false,
      push: false,
      capAlerts: true,
    },
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
        setProfile({
          commissionType: 'percentage', // default fallback
          fixedCommissionAmount: 0,
          ...data,
        });
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          userId,
          startOfCommissionYear: Timestamp.fromDate(new Date(new Date().getFullYear(), 0, 1)),
          commissionType: 'percentage',
          companySplitPercent: 30,
          companySplitCap: 5000,
          royaltyPercent: 6,
          royaltyCap: 3000,
          estimatedTaxPercent: 25,
          fixedCommissionAmount: 0,
          // Personal/Business Information
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          licenseNumber: "",
          zipCode: "",
          state: "",
          // Financial Tracking
          monthlyGoal: 0,
          annualGoal: 0,
          emergencyFund: 0,
          retirementContribution: 0,
          // Additional Settings
          currency: "USD",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: false,
            push: false,
            capAlerts: true,
          },
        };
        setProfile(defaultProfile);
      }
    });

    return () => unsub();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setProfile(prev => {
      const newProfile = {
        ...prev,
        [name]: type === 'date' 
          ? Timestamp.fromDate(new Date(value))
          : type === 'number' 
            ? value === '' ? '' : parseFloat(value) || 0 
            : type === 'checkbox'
              ? checked
              : value
      };
      
      // Auto-calculate company split when commission percent changes
      if (name === 'commissionType') {
        if (value === 'fixed') {
          newProfile.companySplitPercent = '';
          newProfile.companySplitCap = '';
          newProfile.royaltyPercent = '';
          newProfile.royaltyCap = '';
        } else {
          newProfile.companySplitPercent = ''; // Reset to empty string
          newProfile.companySplitCap = ''; // Reset to empty string
          newProfile.royaltyPercent = ''; // Reset to empty string
          newProfile.royaltyCap = ''; // Reset to empty string
        }
      }
      return newProfile;
    });
  };

  const handleNotificationChange = (key: keyof NonNullable<UserProfile['notifications']>) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications?.[key]
      }
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
      
      // Convert string values back to numbers for storage and handle undefined values
      const profileToSave = {
        ...profile,
        companySplitPercent: typeof profile.companySplitPercent === 'string' ? parseFloat(profile.companySplitPercent) || 0 : profile.companySplitPercent,
        companySplitCap: typeof profile.companySplitCap === 'string' ? parseFloat(profile.companySplitCap) || 0 : profile.companySplitCap,
        royaltyPercent: typeof profile.royaltyPercent === 'string' ? parseFloat(profile.royaltyPercent) || 0 : profile.royaltyPercent,
        royaltyCap: typeof profile.royaltyCap === 'string' ? parseFloat(profile.royaltyCap) || 0 : profile.royaltyCap,
        estimatedTaxPercent: typeof profile.estimatedTaxPercent === 'string' ? parseFloat(profile.estimatedTaxPercent) || 0 : profile.estimatedTaxPercent,
        fixedCommissionAmount: typeof profile.fixedCommissionAmount === 'string' ? parseFloat(profile.fixedCommissionAmount) || 0 : (profile.fixedCommissionAmount ?? 0),
        monthlyGoal: typeof profile.monthlyGoal === 'string' ? parseFloat(profile.monthlyGoal) || 0 : (profile.monthlyGoal ?? 0),
        annualGoal: typeof profile.annualGoal === 'string' ? parseFloat(profile.annualGoal) || 0 : (profile.annualGoal ?? 0),
        emergencyFund: typeof profile.emergencyFund === 'string' ? parseFloat(profile.emergencyFund) || 0 : (profile.emergencyFund ?? 0),
        retirementContribution: typeof profile.retirementContribution === 'string' ? parseFloat(profile.retirementContribution) || 0 : (profile.retirementContribution ?? 0),
        // Handle optional string fields - remove undefined values
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        email: profile.email || null,
        phone: profile.phone || null,
        company: profile.company || null,
        licenseNumber: profile.licenseNumber || null,
        zipCode: profile.zipCode || null,
        state: profile.state || null,
        currency: profile.currency || "USD",
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: {
          email: profile.notifications?.email ?? false,
          push: profile.notifications?.push ?? false,
          capAlerts: profile.notifications?.capAlerts ?? false,
        },
        userId,
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(profileRef, profileToSave);

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
                <h2 className="text-2xl font-bold text-gray-900">Commission Structure</h2>
                <p className="text-gray-500 text-sm">Configure your commission structure</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Type</label>
              <select
                name="commissionType"
                value={profile.commissionType || 'percentage'}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            {profile.commissionType === 'percentage' && (
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
                    Used for cap tracking and YTD calculations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Split %
                  </label>
                  <input
                    type="number"
                    name="companySplitPercent"
                    value={profile.companySplitPercent === '' ? '' : profile.companySplitPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Automatically calculated: 100% - Your Commission %
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Split Cap
                  </label>
                  <input
                    type="number"
                    name="companySplitCap"
                    value={profile.companySplitCap === '' ? '' : profile.companySplitCap}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="5000"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum annual amount for company split
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Royalty %
                  </label>
                  <input
                    type="number"
                    name="royaltyPercent"
                    value={profile.royaltyPercent === '' ? '' : profile.royaltyPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="6"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Royalty percentage of your commission
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Royalty Cap
                  </label>
                  <input
                    type="number"
                    name="royaltyCap"
                    value={profile.royaltyCap === '' ? '' : profile.royaltyCap}
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
            )}
            {profile.commissionType === 'fixed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Commission per Deal ($)</label>
                  <input
                    type="number"
                    name="fixedCommissionAmount"
                    value={profile.fixedCommissionAmount === '' ? '' : profile.fixedCommissionAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Flat commission per deal. No percentage or splits will be applied.</p>
                </div>
              </div>
            )}
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
                value={profile.estimatedTaxPercent === '' ? '' : profile.estimatedTaxPercent}
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

          {/* Personal & Business Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal & Business Information</h2>
                <p className="text-gray-500 text-sm">Your contact and business details (all optional)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company/Brokerage</label>
                <input
                  type="text"
                  name="company"
                  value={profile.company ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your brokerage name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={profile.licenseNumber ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Real estate license number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <select
                  name="state"
                  value={profile.state ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select your state</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={profile.zipCode ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
                <p className="text-gray-500 text-sm">Set income targets and savings goals (optional)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Income Goal</label>
                <input
                  type="number"
                  name="monthlyGoal"
                  value={profile.monthlyGoal === '' ? '' : profile.monthlyGoal ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-2">Target monthly take-home income</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Income Goal</label>
                <input
                  type="number"
                  name="annualGoal"
                  value={profile.annualGoal === '' ? '' : profile.annualGoal ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-2">Target annual take-home income</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Fund Target</label>
                <input
                  type="number"
                  name="emergencyFund"
                  value={profile.emergencyFund === '' ? '' : profile.emergencyFund ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-2">Target emergency fund amount</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Retirement Contribution</label>
                <input
                  type="number"
                  name="retirementContribution"
                  value={profile.retirementContribution === '' ? '' : profile.retirementContribution ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-2">Monthly retirement savings goal</p>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Additional Settings</h2>
                <p className="text-gray-500 text-sm">Customize your app experience</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <select
                  name="currency"
                  value={profile.currency ?? "USD"}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                <select
                  name="timezone"
                  value={profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Anchorage">Alaska Time</option>
                  <option value="Pacific/Honolulu">Hawaii Time</option>
                </select>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Cap Alerts</div>
                    <div className="text-sm text-gray-500">Get notified when approaching royalty or company caps</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.capAlerts || false}
                      onChange={() => handleNotificationChange('capAlerts')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive updates via email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.email || false}
                      onChange={() => handleNotificationChange('email')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-500">Receive browser push notifications</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.push || false}
                      onChange={() => handleNotificationChange('push')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
                <p className="text-gray-500 text-sm">Manage your billing and subscription</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">Current Plan</div>
                <div className="text-sm text-gray-600">Agent Money Tracker Pro</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">$4.97</div>
                <div className="text-sm text-gray-500">per month (or yearly)</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/stripe/create-portal-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: user ? (user as { uid: string }).uid : '',
                      }),
                    });
                    if (response.ok) {
                      const { url } = await response.json();
                      window.location.href = url;
                    } else {
                      alert('Failed to create portal session.');
                    }
                  } catch (error) {
                    alert('Error creating portal session.');
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Manage Billing
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your current billing period.')) {
                    // Redirect to Stripe portal where they can cancel
                    const response = await fetch('/api/stripe/create-portal-session', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: user ? (user as { uid: string }).uid : '',
                      }),
                    });
                    if (response.ok) {
                      const { url } = await response.json();
                      window.location.href = url;
                    } else {
                      alert('Failed to open billing portal.');
                    }
                  }
                }}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Cancel Subscription
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>• Manage payment methods and billing information</p>
              <p>• View billing history and download invoices</p>
              <p>• Cancel subscription (access continues until end of billing period)</p>
              <p>• Reactivate subscription anytime</p>
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
            <h3 className="text-xl font-bold">How It Works</h3>
          </div>
          <p className="text-blue-100 mb-4">
            When you enter a deal, the system automatically calculates your earnings based on these settings:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Commission Flow</h4>
              <p className="text-blue-100">Total Deal → Your Commission → Company Split → Royalty → Gross → Taxes → Net</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cap Tracking</h4>
              <p className="text-blue-100">Both company split and royalty have annual caps tracked on your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 