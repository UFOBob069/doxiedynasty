import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useRouter } from 'next/navigation';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { subscription, loading } = useSubscription();
  const router = useRouter();

  // Show loading while checking subscription
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg font-medium">Checking your subscription...</div>
        </div>
      </div>
    );
  }

  // Check if user has active subscription
  const hasActiveSubscription = subscription && (
    subscription.status === 'active' || 
    subscription.status === 'trialing'
  );

  // If no active subscription, show fallback or redirect
  if (!hasActiveSubscription) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback - redirect to subscription required page
    router.replace('/subscription-required');
    return null;
  }

  // User has active subscription, show the protected content
  return <>{children}</>;
} 