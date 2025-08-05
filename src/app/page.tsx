'use client';

import { useState } from 'react';
import { 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  CheckCircle, 
  Gift,
  Instagram,
  Facebook,
  Mail,
  Play
} from 'lucide-react';
import { DOXIE_DYNASTY_PRICING } from '@/lib/stripe';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate email signup (in real app, you'd send to your email service)
    setTimeout(() => {
      setIsSuccess(true);
      setIsSubmitting(false);
      // Redirect to Stripe checkout after a brief delay
      setTimeout(() => {
        window.location.href = '/checkout';
      }, 2000);
    }, 1000);
  };

  const handleDirectCheckout = () => {
    // Redirect directly to Stripe checkout
    window.location.href = '/checkout';
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">
                🐕 Doxie Dynasty
              </h1>
            </div>
            <button
              onClick={scrollToCheckout}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              Get My Game
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🏆 Build Your Ultimate Pack of Wiener Dogs in the Game Made for Doxie Lovers
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Fast-paced. Family-friendly. Infinitely Instagrammable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(DOXIE_DYNASTY_PRICING.CURRENT_PRICE)}
              </div>
              <div className="text-lg text-gray-500 line-through">
                {formatPrice(DOXIE_DYNASTY_PRICING.ORIGINAL_PRICE)}
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                + Free Shipping
              </div>
            </div>

            <button
              onClick={scrollToCheckout}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 py-4 rounded-full font-bold transition-colors shadow-lg hover:shadow-xl"
            >
              ✅ Yes, I Want My Deck!
            </button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-12 animate-fade-in-delayed">
            <div className="bg-gradient-to-r from-orange-200 to-yellow-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🃏</div>
              <p className="text-gray-700 font-medium">
                Eye-catching card layout featuring Sausage Supreme, Vet Visit, and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Doxie Lovers Are Losing Their Minds Over This Game
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🐶',
                title: 'Match Traits to Build Your Dream Pack',
                description: 'Collect and combine unique dachshund traits to create the ultimate pack.'
              },
              {
                icon: '🎉',
                title: 'Survive Chaos Cards Like "Vet Visit" & "Bark-Off"',
                description: 'Navigate hilarious event cards that test your pack\'s resilience.'
              },
              {
                icon: '👑',
                title: 'Score Big to Be Crowned Ruler of the Doxie Dynasty',
                description: 'Compete to become the ultimate dachshund dynasty ruler.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="text-orange-600 hover:text-orange-700 font-semibold flex items-center justify-center mx-auto gap-2">
              <Play className="w-4 h-4" />
              Download How to Play PDF
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Loved by Families, Game Nights, and Real-Life Sausage Dogs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: 'My 10-year-old and our dachshund Milo played this 3 nights in a row.',
                author: 'Sarah M.',
                rating: 5
              },
              {
                text: 'Perfect gift for my doxie-obsessed sister. She absolutely loves it!',
                author: 'Mike R.',
                rating: 5
              },
              {
                text: 'The chaos cards are hilarious! Our family game night has never been better.',
                author: 'Jennifer L.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.author}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5" />
              <span>Satisfaction Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-5 h-5" />
              <span>Dachshund Rescue Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Give Back Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              10% of Profits Support Dachshund Rescue Organizations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every purchase helps rescue and care for dachshunds in need. 
              We partner with local rescue organizations to provide medical care, 
              food, and loving homes for these amazing dogs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                image: '🐕',
                caption: 'Rescued dachshund finding their forever home'
              },
              {
                image: '🏥',
                caption: 'Medical care for injured dachshunds'
              },
              {
                image: '🏠',
                caption: 'Foster care and rehabilitation'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-6xl mb-4">{item.image}</div>
                <p className="text-gray-700 font-medium">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What's Inside Your Doxie Dynasty Deck
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Card Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="font-semibold">Doxie Cards:</span>
                    <span className="text-gray-600">Smooth, long, wire-haired with quirky traits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold">Event Cards:</span>
                    <span className="text-gray-600">Vet Visit, Bark-Off, and other chaos cards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-semibold">Special Cards:</span>
                    <span className="text-gray-600">Rare and legendary dachshund cards</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center animate-fade-in-delayed">
              <div className="bg-gradient-to-br from-orange-200 to-yellow-200 rounded-2xl p-8">
                <div className="text-8xl mb-4">🃏</div>
                <p className="text-xl font-semibold text-gray-800 mb-4">
                  It's Like Pokémon, But Cuter
                </p>
                <button
                  onClick={scrollToCheckout}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  Get My Deck
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture + Checkout Section */}
      <section id="checkout-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Limited First Print Run – 500 Decks Only!
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="text-4xl font-bold text-orange-600">
                {formatPrice(DOXIE_DYNASTY_PRICING.CURRENT_PRICE)}
              </div>
              <div className="text-2xl text-gray-500 line-through">
                {formatPrice(DOXIE_DYNASTY_PRICING.ORIGINAL_PRICE)}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mb-8">
              <Truck className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-semibold">Free U.S. Shipping | 5–7 Days</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 animate-fade-in-delayed">
            {!isSuccess ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Get Updates & Special Offers!
                  </h3>
                  <p className="text-gray-600">
                    Join our email list for exclusive dachshund content, game tips, and early access to new expansions.
                  </p>
                </div>

                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xl py-4 rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? 'Joining...' : 'Join the Pack & Get My Game!'}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Or skip the email and go straight to checkout:</p>
                  <button
                    onClick={handleDirectCheckout}
                    className="text-orange-600 hover:text-orange-700 font-semibold underline"
                  >
                    Buy Now Without Email Signup
                  </button>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span>Perfect Gift</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to the Pack! 🐕
                </h3>
                <p className="text-gray-600 mb-6">
                  Redirecting you to secure checkout...
                </p>
                <div className="animate-pulse">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'What if I don\'t own a dachshund?',
                answer: 'You\'ll still love it! The game is designed to be fun for everyone, whether you own a dachshund or just appreciate their adorable nature.'
              },
              {
                question: 'Is it fun for kids?',
                answer: 'Yes! The game is family-friendly and suitable for ages 8+. Kids love the cute artwork and simple gameplay mechanics.'
              },
              {
                question: 'How many people can play?',
                answer: 'Doxie Dynasty is designed for 2 to 6 players, making it perfect for family game nights or small gatherings.'
              },
              {
                question: 'Can I send it as a gift?',
                answer: 'Absolutely! You can add a gift note during checkout, and we\'ll include it with the order. Perfect for dachshund lovers!'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">🐕 Doxie Dynasty</h3>
              <p className="text-gray-300 mb-4">
                Cuteness. Chaos. Cards.
              </p>
              <p className="text-gray-400 text-sm">
                The ultimate card game for dachshund lovers everywhere.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Updates</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get updates on new booster packs and exclusive Doxie drops!
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm font-semibold transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Doxie Dynasty. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Refund Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
