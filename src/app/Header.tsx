"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState<unknown>(null);
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-700">
            AgentMoneyTracker
          </Link>
          <nav className="flex items-center space-x-4">
            {user && typeof user === 'object' && ('displayName' in user || 'email' in user) ? (
              <>
                <Link href="/dashboard" className="text-blue-700 font-semibold hover:underline">Dashboard</Link>
                <Link href="/deals" className="text-gray-700 hover:text-blue-700">Deals</Link>
                <Link href="/expenses" className="text-gray-700 hover:text-blue-700">Expenses</Link>
                <Link href="/settings" className="text-gray-700 hover:text-blue-700">Settings</Link>
                <span className="text-gray-700 text-sm font-medium">{(user as { displayName?: string; email?: string }).displayName || (user as { email?: string }).email}</span>
                <button
                  onClick={async () => { await signOut(auth); }}
                  className="text-blue-700 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className="text-gray-700 hover:text-blue-700">Sign In</Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 