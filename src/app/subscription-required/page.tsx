import Link from 'next/link';

export default function SubscriptionRequiredPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Message */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-amber-800 mb-4">Premium Feature</h1>
          <p className="text-amber-700 text-lg mb-6">
            This feature is available to subscribers only.<br />
            Start your 30-day free trial to unlock all features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/dashboard#subscription" 
              className="bg-white border border-amber-300 text-amber-700 px-8 py-4 rounded-xl font-semibold shadow hover:bg-amber-50 transition-all"
            >
              Manage Subscription
            </Link>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-700 italic mb-3">
              &ldquo;This tool has completely transformed how I track my real estate business. The commission calculations are spot-on and save me hours every month.&rdquo;
            </p>
            <p className="text-gray-600 font-medium">– Sarah G., Austin TX</p>
            <p className="text-sm text-gray-500">Top Producer, 15+ years experience</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-700 italic mb-3">
              &ldquo;Finally, a tool that understands real estate agents! The mileage tracking alone has saved me thousands in tax deductions.&rdquo;
            </p>
            <p className="text-gray-600 font-medium">– Mike R., Phoenix AZ</p>
            <p className="text-sm text-gray-500">Independent Agent, 8 years experience</p>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You&apos;ll Get with Your Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Commission Tracking</h3>
              <p className="text-gray-600 text-sm">Automatically calculate splits, caps, and royalties with real-time updates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🚗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mileage Logging</h3>
              <p className="text-gray-600 text-sm">Track business miles with automatic distance calculation and tax-ready reports</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expense Management</h3>
              <p className="text-gray-600 text-sm">Log receipts, categorize expenses, and generate tax reports instantly</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Join hundreds of agents who&apos;ve simplified their financial tracking</p>
          <Link 
            href="/signup" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-block"
          >
            Start Your 30-Day Free Trial
          </Link>
          <p className="text-sm text-gray-500 mt-3">No credit card required • Cancel anytime</p>
        </div>
      </div>
    </main>
  );
} 