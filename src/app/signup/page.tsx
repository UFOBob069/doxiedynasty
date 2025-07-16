"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import PricingPlans from '../../components/PricingPlans';
import { getStripe } from '../../lib/stripe';
import { setCookie } from 'cookies-next';

type SignupStep = 'account' | 'pricing' | 'checkout';

export default function SignUpPage() {
  const [step, setStep] = useState<SignupStep>('account');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  // Remove unused router
  // const router = useRouter();

  // Check if user is already signed in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setStep('pricing');
      }
    });
    return unsubscribe;
  }, []);

  // Google sign in handler
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setStep('pricing');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign in failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Email sign up handler
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setUser(result.user);
      setStep('pricing');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Email sign up failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle plan selection and redirect to Stripe checkout
  const handlePlanSelect = async (planType: 'monthly' | 'yearly', couponCode?: string) => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          planType,
          couponCode,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        setError(error);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          setError(error.message || 'Failed to redirect to checkout');
        } else {
          // Simulate setting the cookie after successful checkout (in production, set this after webhook)
          setCookie('hasActiveSubscription', '1', { path: '/' });
        }
      }
    } catch {
      setError('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Render different steps
  if (step === 'pricing') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Agent Money Tracker</h1>
            <p className="text-gray-600 text-lg">Complete your account setup by choosing a plan</p>
          </div>
          
          <PricingPlans onPlanSelect={handlePlanSelect} loading={loading} />
          
          {error && (
            <div className="mt-8 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm max-w-md mx-auto">
                {error}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Account creation step
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-700">Create Your Free Account</h2>
        <p className="text-gray-600 text-center mb-4">Start tracking your deals, commissions, and expenses in seconds.</p>
        
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-gray-50 transition mb-4 disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.18 5.59C43.93 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.01-2.99-1.01-6.21 0-9.2l-7.98-6.2C.9 17.1 0 20.43 0 24c0 3.57.9 6.9 2.69 10.55l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.57l-7.18-5.59c-2.01 1.35-4.59 2.15-7.96 2.15-6.38 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Continue with Google
        </button>
        
        {error && <div className="text-red-600 text-sm mb-2 text-center">{error}</div>}
        
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
        
        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-lg disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-700 font-semibold hover:underline">Sign In</Link>
        </div>
      </div>
    </main>
  );
} 