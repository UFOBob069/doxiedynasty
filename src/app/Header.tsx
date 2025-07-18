"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-700" onClick={closeMobileMenu}>
            AgentMoneyTracker
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/dashboard" onClick={closeMobileMenu} className="hover:underline">Dashboard</Link>
            <Link href="/deals" onClick={closeMobileMenu} className="hover:underline">Deals</Link>
            <Link href="/expenses" onClick={closeMobileMenu} className="hover:underline">Expenses</Link>
            <Link href="/mileage" onClick={closeMobileMenu} className="hover:underline">Log Mileage</Link>
            <Link href="/settings" onClick={closeMobileMenu} className="hover:underline">Settings</Link>
            {user && (
              <button onClick={handleSignOut} className="ml-4 text-gray-500 hover:text-red-600 font-semibold">Sign Out</button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-700 focus:outline-none focus:text-blue-700"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-blue-700 font-semibold hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/deals" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Deals
                  </Link>
                  <Link 
                    href="/expenses" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Expenses
                  </Link>
                  <Link 
                    href="/mileage" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Log Mileage
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Settings
                  </Link>
                  <div className="px-3 py-2 text-gray-700 text-sm font-medium border-t border-gray-200 mt-2 pt-2">
                    {user.displayName || user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-blue-700 font-semibold hover:bg-blue-50 rounded-md bg-transparent border-none cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/signin" 
                    className="block px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block px-3 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 