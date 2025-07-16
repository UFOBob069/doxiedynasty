import React, { useState } from 'react';

interface PricingPlansProps {
  onPlanSelect: (planType: 'monthly' | 'yearly', couponCode?: string) => void;
  loading?: boolean;
}

export default function PricingPlans({ onPlanSelect, loading = false }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const handlePlanSelect = () => {
    onPlanSelect(selectedPlan, couponCode || undefined);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 text-lg">
          Start with a 30-day free trial. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Monthly Plan */}
        <div 
          className={`relative p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
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
            
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                30-day free trial
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Cancel anytime
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                All features included
              </li>
            </ul>
          </div>
        </div>

        {/* Yearly Plan */}
        <div 
          className={`relative p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            selectedPlan === 'yearly' 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          {selectedPlan === 'yearly' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Save 18%
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
            
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                30-day free trial
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Save $10.64/year
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                All features included
              </li>
            </ul>
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

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handlePlanSelect}
          disabled={loading}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {loading ? 'Processing...' : `Start ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Trial`}
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          No commitment required. Cancel anytime during your trial.
        </p>
      </div>
    </div>
  );
} 