"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function SignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Check if user is already signed in and redirect appropriately
  useEffect(() => {
    console.log('Signin page useEffect running');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged triggered, user:', user ? user.email : 'null');
      console.log('Current auth state:', auth.currentUser ? auth.currentUser.email : 'null');
      
      if (user) {
        console.log('User signed in:', user.email);
        // Check if user has a subscription
        try {
          const userRef = doc(db, 'userSubscriptions', user.uid);
          const userDoc = await getDoc(userRef);
          
          console.log('Subscription check - exists:', userDoc.exists());
          
          if (userDoc.exists()) {
            console.log('User has subscription, redirecting to dashboard');
            // If user has any subscription record (even incomplete), send to dashboard
            router.replace("/dashboard");
          } else {
            console.log('User has no subscription, redirecting to dashboard to show subscription required');
            // User exists but no subscription - send to dashboard which will show subscription required
            router.replace("/dashboard");
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
          // If there's an error, send to dashboard and let it handle the subscription check
          router.replace("/dashboard");
        }
      } else {
        console.log('No user signed in');
        setAuthLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  // Google sign in handler
  const handleGoogle = async () => {
    console.log('Google sign-in button clicked');
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      console.log('About to call signInWithPopup');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user.email);
      // The useEffect above will handle the redirect
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const errorMessage = err instanceof Error ? err.message : "Google sign in failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Email sign in handler (optional, not wired up yet)
  // ...

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Checking your account...</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In | AgentMoneyTracker</title>
        <meta name="description" content="Secure sign in for real estate agents. Access your AgentMoneyTracker dashboard to manage commissions, expenses, and more." />
        <meta property="og:title" content="Sign In | AgentMoneyTracker" />
        <meta property="og:description" content="Secure sign in for real estate agents. Access your AgentMoneyTracker dashboard to manage commissions, expenses, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentmoneytracker.com/signin" />
        <meta property="og:image" content="/public/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign In | AgentMoneyTracker" />
        <meta name="twitter:description" content="Secure sign in for real estate agents. Access your AgentMoneyTracker dashboard to manage commissions, expenses, and more." />
        <meta name="twitter:image" content="/public/og-image.png" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Sign In</h2>
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
          <form className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>
          <div className="text-center mt-4 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-700 font-semibold hover:underline">Sign Up</Link>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-gray-500">
          Need help? Email <a href="mailto:support@agentmoneytracker.com" className="underline hover:text-blue-600">support@agentmoneytracker.com</a>
        </div>
      </main>
    </>
  );
} 