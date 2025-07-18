import Link from 'next/link';

export default function ForAgentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Title & Intro */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">Built for Real Estate Agents, by Real Estate Agents</h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            AgentMoneyTracker helps you take control of your commission, expenses, and tax estimates—without the spreadsheet mess or CRM overload.
          </p>
        </section>

        {/* 1. Track Every Commission */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">🧾</span>
            <h2 className="text-2xl font-bold text-gray-900">Track Every Commission</h2>
          </div>
          <p className="text-gray-700 mb-4">Never wonder if you got paid correctly again.<br />
            Log your gross commission, company split, royalty, and referral fees in seconds. Your net is calculated instantly—and tracked against your cap.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            “I used to dig through my closing docs to check every number. Now I see everything in one place. Total game-changer.” <span className="not-italic font-medium">– Alex, KW agent</span>
          </blockquote>
        </section>

        {/* 2. Monitor Your Expenses */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">💸</span>
            <h2 className="text-2xl font-bold text-gray-900">Monitor Your Expenses</h2>
          </div>
          <p className="text-gray-700 mb-4">Write-offs, mileage, staging, dues—all in one place.<br />
            Stop missing deductions or scrambling during tax season.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            “I didn’t realize how much I was spending on staging and meals until I saw it all together. This helped me cut back and save.” <span className="not-italic font-medium">– Jasmine, solo agent</span>
          </blockquote>
        </section>

        {/* 3. Stay Ahead of Your Cap */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">📆</span>
            <h2 className="text-2xl font-bold text-gray-900">Stay Ahead of Your Cap</h2>
          </div>
          <p className="text-gray-700 mb-4">Track exactly how close you are to capping with your brokerage and royalty fees.<br />
            Enter your anniversary date once—we track your progress automatically.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            “This is my first year at KW. I had no idea how close I was to hitting my cap until this tool showed me. That’s thousands I would’ve missed.” <span className="not-italic font-medium">– Daniel, first-year agent</span>
          </blockquote>
        </section>

        {/* 4. Estimate Your Taxes */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">🧮</span>
            <h2 className="text-2xl font-bold text-gray-900">Estimate Your Taxes</h2>
          </div>
          <p className="text-gray-700 mb-4">No more surprises at tax time.<br />
            Set your estimated tax rate, and we’ll show you how much to save on every deal.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            “It’s like a quiet little tax coach in my pocket.” <span className="not-italic font-medium">– Sarah, part-time agent</span>
          </blockquote>
        </section>

        {/* 5. See the Big Picture */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">See the Big Picture</h2>
          </div>
          <p className="text-gray-700 mb-4">Know your total income, expenses, and net profit at a glance.<br />
            Filter by month, year, or deal—and export it all when you need it.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            “I had no idea how profitable I really was until I saw it on the dashboard.” <span className="not-italic font-medium">– Joe, team lead</span>
          </blockquote>
        </section>

        {/* Final CTA */}
        <section className="sticky bottom-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-white mb-2">Built for agents. Priced to make sense.</h2>
          <p className="text-lg text-blue-100 mb-4">Start Free 30-Day Trial – <span className="font-semibold text-white">$4.97/month</span> after<br />
            <span className="text-sm">Cancel anytime. Keep your data.</span>
          </p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
            Start Free 30-Day Trial
          </Link>
        </section>
      </div>
    </main>
  );
} 