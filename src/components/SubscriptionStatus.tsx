import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

export default function SubscriptionStatus() {
  const { subscription, loading, isInTrial, getDaysLeftInTrial, getSubscriptionStatus } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-800 mb-2">No Active Subscription</h3>
            <p className="text-amber-700 mb-4">
              You need an active subscription to access all features. Start your 30-day free trial today.
            </p>
            <a
              href="/signup"
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 inline-block"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'trialing':
        return 'text-blue-600';
      case 'active':
        return 'text-green-600';
      case 'past_due':
        return 'text-orange-600';
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'trialing':
        return '🎯';
      case 'active':
        return '✅';
      case 'past_due':
        return '⚠️';
      case 'canceled':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div id="subscription" className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">{getStatusIcon()}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Subscription Status</h3>
            <p className="text-gray-500 text-sm">Manage your subscription</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-blue-50`}>
          {getSubscriptionStatus()}
        </span>
      </div>

      <div className="space-y-4">
        {isInTrial() && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800">Free Trial</h4>
                <p className="text-blue-600 text-sm">
                  {getDaysLeftInTrial()} days remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {getDaysLeftInTrial()}
                </div>
                <div className="text-xs text-blue-500">days left</div>
              </div>
            </div>
          </div>
        )}

        {subscription.planType && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {subscription.planType} ({subscription.planType === 'monthly' ? '$4.97/month' : '$49/year'})
            </span>
          </div>
        )}

        {subscription.currentPeriodEnd && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Next billing:</span>
            <span className="font-semibold text-gray-900">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {subscription.couponCode && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Coupon applied:</span>
            <span className="font-semibold text-green-600">
              {subscription.couponCode}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => window.open('https://billing.stripe.com/login', '_blank')}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Manage Billing
          </button>
          <button
            onClick={() => window.open('https://support.stripe.com', '_blank')}
            className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors"
          >
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
} 