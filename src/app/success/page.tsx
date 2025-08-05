'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Home, Package } from 'lucide-react';

interface OrderDetails {
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
}

export default function SuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({});

  useEffect(() => {
    // Get order details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const customerName = urlParams.get('customerName');
    const customerEmail = urlParams.get('customerEmail');

    if (orderId || customerName || customerEmail) {
      setOrderDetails({
        orderId: orderId || undefined,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Confirmed! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your order! You&apos;re now part of the Doxie Dynasty family.
            </p>

            {orderDetails.orderId && (
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                <div className="space-y-2 text-left">
                  <p><span className="font-medium">Order ID:</span> {orderDetails.orderId}</p>
                  {orderDetails.customerName && (
                    <p><span className="font-medium">Name:</span> {orderDetails.customerName}</p>
                  )}
                  {orderDetails.customerEmail && (
                    <p><span className="font-medium">Email:</span> {orderDetails.customerEmail}</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">What&apos;s Next?</h3>
              </div>
              <div className="text-left space-y-2 text-gray-700">
                <p>📧 You&apos;ll receive an order confirmation email shortly</p>
                <p>📦 Your game will ship within 1-2 business days</p>
                <p>🚚 Free shipping takes 5-7 days to arrive</p>
                <p>📱 We&apos;ll send tracking info when it ships</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 