import Link from 'next/link';

export default function SubscriptionRequiredPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Subscription Required</h1>
        <p className="text-amber-700 mb-6">
          You need an active subscription to access this feature.<br />
          Start your 30-day free trial or manage your subscription below.
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/dashboard#subscription" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            Go to Subscription Settings
          </Link>
          <Link href="/signup" className="bg-white border border-amber-300 text-amber-700 px-6 py-3 rounded-xl font-semibold shadow hover:bg-amber-50 transition-all">
            Start Free Trial
          </Link>
        </div>
      </div>
    </main>
  );
} 