import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="animate-fade-in">
          <div className="text-8xl mb-6">🐕</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Oops! This page doesn&apos;t exist
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like this dachshund wandered off! Let&apos;s get you back to the game.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            
            <div className="text-sm text-gray-500">
              <Link href="/#checkout-section" className="text-orange-600 hover:text-orange-700 underline">
                Or go to checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 