import React, { useState } from 'react';

interface PricingPlansProps {
  onPlanSelect: (planType: 'monthly' | 'yearly', couponCode?: string) => void;
  loading?: boolean;
}

export default function PricingPlans({ onPlanSelect, loading = false }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const handlePlanSelect = (planType: 'monthly' | 'yearly') => {
    onPlanSelect(planType, couponCode || undefined);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 text-lg">
          Start with a 30-day free trial. Cancel anytime.
        </p>
      </div>

      {/* Trust Signals */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm text-green-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure checkout powered by Stripe
        </div>
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm text-blue-700 ml-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Data encrypted and SOC 2-ready (Firebase)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Plan */}
        <div 
          className={`relative p-8 rounded-2xl border-2 transition-all duration-200 ${
            selectedPlan === 'monthly' 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('monthly')}
        >
          {selectedPlan === 'monthly' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">$4.97</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            <p className="text-gray-600 mb-6">Perfect for getting started</p>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                Full access, no commitment
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                30-day free trial
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                Try it risk-free
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                All features included
              </li>
            </ul>

            {/* Action Button - Directly under Monthly plan */}
            <button
              onClick={() => handlePlanSelect('monthly')}
              disabled={loading}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedPlan === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {loading ? 'Processing...' : 'Start Monthly Trial'}
            </button>
          </div>
        </div>

        {/* Yearly Plan */}
        <div 
          className={`relative p-8 rounded-2xl border-2 transition-all duration-200 ${
            selectedPlan === 'yearly' 
              ? 'border-green-500 bg-green-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          {selectedPlan === 'yearly' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Save 22%
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">$49</span>
              <span className="text-gray-600 ml-2">/year</span>
            </div>
            <p className="text-gray-600 mb-6">Best value for long-term use</p>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                30-day free trial
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                Save 22% vs. monthly
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                Cancel anytime
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                All features included
              </li>
            </ul>

            {/* Action Button - Directly under Yearly plan */}
            <button
              onClick={() => handlePlanSelect('yearly')}
              disabled={loading}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedPlan === 'yearly'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {loading ? 'Processing...' : 'Start Yearly Trial'}
            </button>
          </div>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="text-center mb-8">
        <button
          type="button"
          onClick={() => setShowCouponInput(!showCouponInput)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showCouponInput ? 'Hide' : 'Have a coupon code?'}
        </button>
        
        {showCouponInput && (
          <div className="mt-4 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        )}
      </div>

      {/* Testimonial */}
      <div className="text-center mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-gray-700 text-lg italic mb-3">
            &ldquo;So much easier than my spreadsheet. Worth every penny.&rdquo;
          </p>
          <p className="text-gray-600 font-medium">– Sarah G., Austin TX</p>
        </div>
      </div>

      {/* Mobile-friendly CTA for smaller screens */}
      <div className="lg:hidden text-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to get started?</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handlePlanSelect('monthly')}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
              }`}
            >
              {loading ? 'Processing...' : 'Monthly'}
            </button>
            <button
              onClick={() => handlePlanSelect('yearly')}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
              }`}
            >
              {loading ? 'Processing...' : 'Yearly'}
            </button>
          </div>
        </div>
      </div>

      {/* Trust and Security Note */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          🔒 Your data is secure. We use industry-standard encryption and never store your payment information.
        </p>
      </div>
    </div>
  );
} 