'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Truck, Heart, Mail } from 'lucide-react';
import Link from 'next/link';

interface OrderDetails {
  sessionId: string;
  estimatedDelivery: string;
}

export default function SuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // In a real app, you might want to fetch order details from your backend
      setOrderDetails({
        sessionId,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Thank You for Your Order!
            </h1>
            <p className="text-gray-600">
              Your Doxie Dynasty card game is on its way!
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What's Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700">
                  Check your email for order confirmation and tracking details
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700">
                  Estimated delivery: {orderDetails?.estimatedDelivery || '5-7 business days'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700">
                  10% of your purchase supports dachshund rescue organizations
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              While You Wait...
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📖 Read the Rules</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download the complete rulebook to get ready for game night
                </p>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-semibold">
                  Download PDF →
                </button>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📸 Share the Love</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Follow us on social media for dachshund content and game tips
                </p>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                    Instagram
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 