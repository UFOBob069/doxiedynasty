import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserSubscription, SubscriptionStatus } from '../lib/stripe';

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'userSubscriptions', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserSubscription;
        setSubscription({
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
          currentPeriodStart: data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined,
          currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
          trialStart: data.trialStart ? new Date(data.trialStart) : undefined,
          trialEnd: data.trialEnd ? new Date(data.trialEnd) : undefined,
        });
      } else {
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const hasActiveSubscription = (): boolean => {
    if (!subscription) return false;
    
    const activeStatuses: SubscriptionStatus[] = ['trialing', 'active'];
    return activeStatuses.includes(subscription.status);
  };

  const isInTrial = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'trialing';
  };

  const getDaysLeftInTrial = (): number => {
    if (!subscription?.trialEnd) return 0;
    
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const getSubscriptionStatus = (): string => {
    if (!subscription) return 'No subscription';
    
    switch (subscription.status) {
      case 'trialing':
        const daysLeft = getDaysLeftInTrial();
        return daysLeft > 0 ? `Trial (${daysLeft} days left)` : 'Trial expired';
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Payment past due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Payment failed';
      default:
        return subscription.status;
    }
  };

  return {
    subscription,
    loading,
    hasActiveSubscription,
    isInTrial,
    getDaysLeftInTrial,
    getSubscriptionStatus,
  };
} 