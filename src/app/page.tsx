import Link from 'next/link';
import Image from 'next/image';

const testimonials = [
  {
    name: "Sarah M.",
    role: "Top Producer, Keller Williams",
    quote: "AgentMoneyTracker makes tracking my deals and expenses effortless. I love how fast and simple it is!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James T.",
    role: "Realtor, Compass",
    quote: "The mileage tracker and receipt uploads save me hours every month. Highly recommend!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Linda C.",
    role: "Broker Associate, eXp Realty",
    quote: "Finally, a tool built for agents that just works. My accountant loves the reports!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4 text-center">AgentMoneyTracker</h1>
      <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl text-center">
        The fastest, simplest way for real estate agents to track deals, commissions, and expenses. Stay organized, maximize your income, and get instant financial insights—anywhere, anytime.
      </p>
      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 opacity-80">
        <Image src="/trusted1.png" alt="Trusted Brokerage 1" width={32} height={32} className="h-8" />
        <Image src="/trusted2.png" alt="Trusted Brokerage 2" width={32} height={32} className="h-8" />
        <Image src="/trusted3.png" alt="Trusted Brokerage 3" width={32} height={32} className="h-8" />
        <Image src="/trusted4.png" alt="Trusted Brokerage 4" width={32} height={32} className="h-8" />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition text-center">
          Try the Demo
        </Link>
        <Link href="/signup" className="bg-white border border-blue-600 text-blue-700 px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-50 transition text-center">
          Sign Up Free
        </Link>
      </div>
      <ul className="text-gray-600 text-base max-w-md mx-auto space-y-2 mb-10">
        <li>✔️ Log deals and auto-calculate net commissions</li>
        <li>✔️ Track expenses and upload receipts</li>
        <li>✔️ Generate instant profit & loss reports</li>
        <li>✔️ Mobile-first, 30-second entry forms</li>
        <li>✔️ Secure, cloud-based, and always accessible</li>
      </ul>
      {/* Testimonials */}
      <div className="w-full max-w-3xl mx-auto mb-12">
        <h3 className="text-xl font-bold text-center mb-6 text-blue-700">What Agents Are Saying</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
              <Image src={t.avatar} alt={t.name} width={64} height={64} className="w-16 h-16 rounded-full mb-3 object-cover" />
              <p className="text-gray-700 italic mb-2">"{t.quote}"</p>
              <span className="font-semibold text-gray-900">{t.name}</span>
              <span className="text-xs text-gray-500">{t.role}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Trust badge */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm shadow">Trusted by 1,000+ real estate agents</span>
        <span className="text-xs text-gray-400">SOC 2 & GDPR Compliant</span>
      </div>
    </main>
  );
}
