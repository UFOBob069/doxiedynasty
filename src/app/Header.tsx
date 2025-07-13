"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 mb-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-blue-700 hover:underline">AgentMoneyTracker</Link>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-blue-700 font-semibold hover:underline">Dashboard</Link>
              <span className="text-gray-700 text-sm font-medium">{user.displayName || user.email}</span>
              <button
                onClick={async () => { await signOut(auth); }}
                className="text-blue-700 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >Sign Out</button>
            </div>
          ) : (
            <Link href="/signin" className="text-blue-700 font-semibold hover:underline">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
} 