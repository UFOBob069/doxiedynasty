import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

const testimonials = [
  {
    name: "Sarah M.",
    role: "Top Producer, Keller Williams",
    quote: "AgentMoneyTracker makes tracking my deals and expenses effortless. I love how fast and simple it is!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    name: "James T.",
    role: "Realtor, Compass",
    quote: "The mileage tracker and receipt uploads save me hours every month. Highly recommend!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Linda C.",
    role: "Broker Associate, eXp Realty",
    quote: "Finally, a tool built for agents that just works. My accountant loves the reports!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
  },
];

const features = [
  {
    icon: "💰",
    title: "Smart Commission Tracking",
    description: "Auto-calculate net commissions with royalty caps, splits, and tax estimates"
  },
  {
    icon: "📱",
    title: "30-Second Entry",
    description: "Mobile-first forms designed for speed. Log deals and expenses in seconds"
  },
  {
    icon: "📊",
    title: "Real-Time Insights",
    description: "Instant profit & loss reports with visual charts and tax projections"
  },
  {
    icon: "🧾",
    title: "Expense & Mileage Tracking",
    description: "Track every business expense and trip. Maximize deductions and simplify tax time."
  },
  {
    icon: "☁️",
    title: "Always Accessible",
    description: "Cloud-based platform works on any device, anywhere, anytime"
  },
  {
    icon: "📈",
    title: "Income Optimization",
    description: "Track expenses, maximize deductions, and boost your bottom line"
  }
];

const stats = [
  { number: "1,000+", label: "Active Agents" },
  { number: "50,000+", label: "Deals Tracked" },
  { number: "99.9%", label: "Uptime" },
  { number: "4.9/5", label: "Agent Rating" }
];

const howItWorks = [
  {
    step: "1",
    title: "Start Free Trial",
    description: "Create your account in 30 seconds. 30-day free trial included."
  },
  {
    step: "2", 
    title: "Configure Settings",
    description: "Set your commission splits, royalty caps, and tax rates."
  },
  {
    step: "3",
    title: "Start Tracking",
    description: "Log deals and expenses. Get instant financial insights."
  }
];

export default function Home() {
  return (
    <>
      <Head>
        <title>AgentMoneyTracker: Real Estate Agent Commission, Expense & Cap Tracking</title>
        <meta name="description" content="Track your real estate commissions, expenses, caps, and tax estimates in one place. Built for agents. Fast, easy, and mobile-friendly." />
        <meta property="og:title" content="AgentMoneyTracker: Real Estate Agent Commission, Expense & Cap Tracking" />
        <meta property="og:description" content="Track your real estate commissions, expenses, caps, and tax estimates in one place. Built for agents. Fast, easy, and mobile-friendly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentmoneytracker.com/" />
        <meta property="og:image" content="/public/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AgentMoneyTracker: Real Estate Agent Commission, Expense & Cap Tracking" />
        <meta name="twitter:description" content="Track your real estate commissions, expenses, caps, and tax estimates in one place. Built for agents. Fast, easy, and mobile-friendly." />
        <meta name="twitter:image" content="/public/og-image.png" />
      </Head>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Trusted by 1,000+ real estate agents
            </div>
            {/* Add For Agents button */}
            <div className="mb-6">
              <Link href="/for-agents" className="inline-block bg-white border-2 border-blue-600 text-blue-700 px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-50 transition-all duration-200 text-base">
                Why Agents Love This →
              </Link>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Track Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Money</span>
              <br />
              Like a Pro
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The fastest, simplest way for real estate agents to track deals, commissions, and expenses. 
              Stay organized, maximize your income, and get instant financial insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg">
                Start Free 30-Day Trial
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 font-medium mb-2">
                Just $4.97/month or $49/year after trial
              </p>
              <p className="text-sm text-gray-500">Cancel anytime • No commitment</p>
            </div>
            
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                30-day free trial
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Secure checkout
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Built for real estate agents
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built specifically for real estate agents, with features that actually matter to your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started in Minutes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple setup process that gets you tracking your money immediately.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transform translate-x-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Agents Are Saying</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of agents who&apos;ve transformed their financial tracking.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 italic mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote.replace(/'/g, '&apos;')}&rdquo;
                  </p>
                  
                  <div className="flex items-center">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      width={48} 
                      height={48} 
                      className="w-12 h-12 rounded-full mr-4 object-cover" 
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Take Control of Your Money?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start tracking your deals and expenses today. Join thousands of agents who&apos;ve already transformed their financial management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg">
                Start Free 30-Day Trial
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <p className="text-lg text-white font-medium mb-2">
                Just $4.97/month or $49/year after trial
              </p>
              <p className="text-blue-100 text-sm">Cancel anytime • No commitment</p>
            </div>
            
            <div className="mt-8 text-blue-100 text-sm">
              <p>✓ 30-day free trial • ✓ Secure checkout • ✓ Built for real estate agents</p>
              <p className="mt-2">SOC 2 & GDPR Compliant • Bank-level security</p>
            </div>
          </div>
        </section>
        <footer className="mt-16 text-center text-sm text-gray-500">
          Need help? Email <a href="mailto:support@agentmoneytracker.com" className="underline hover:text-blue-600">support@agentmoneytracker.com</a>
        </footer>
      </main>
    </>
  );
}
