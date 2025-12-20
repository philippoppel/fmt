"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AccountType } from "@prisma/client";
import {
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStatus,
} from "@/lib/stripe/subscription-manager";
import { SUBSCRIPTION_PLANS, type SubscriptionChangeResult } from "@/lib/stripe/types";

// ============================================
// SUBSCRIPTION CHANGE ACTIONS
// ============================================

export type ChangeTierResult = SubscriptionChangeResult;

/**
 * Change subscription tier (upgrade or downgrade)
 */
export async function changeTier(newTier: AccountType): Promise<ChangeTierResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's profile
  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  const currentTier = profile.accountType;

  // Validate tier
  if (!SUBSCRIPTION_PLANS[newTier]) {
    return { success: false, error: "Invalid subscription tier" };
  }

  // Same tier - no change needed
  if (currentTier === newTier) {
    return { success: false, error: "Already on this tier" };
  }

  const currentPrice = SUBSCRIPTION_PLANS[currentTier].price;
  const newPrice = SUBSCRIPTION_PLANS[newTier].price;

  // Determine if upgrade or downgrade
  if (newPrice > currentPrice) {
    return upgradeSubscription(profile.id, newTier);
  } else {
    return downgradeSubscription(profile.id, newTier);
  }
}

/**
 * Cancel current subscription
 */
export async function cancelCurrentSubscription(): Promise<ChangeTierResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  return cancelSubscription(profile.id);
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateCurrentSubscription(): Promise<ChangeTierResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  return reactivateSubscription(profile.id);
}

// ============================================
// SUBSCRIPTION STATUS
// ============================================

export interface SubscriptionStatusResult {
  accountType: AccountType;
  subscriptionStatus: string;
  subscriptionEndsAt: Date | null;
  nextBillingDate: Date | null;
  plan: {
    name: string;
    price: number;
    features: string[];
  };
  isActive: boolean;
  isCanceled: boolean;
  willDowngrade: boolean;
}

/**
 * Get current subscription status
 */
export async function getCurrentSubscription(): Promise<SubscriptionStatusResult | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return null;
  }

  const status = await getSubscriptionStatus(profile.id);
  if (!status) {
    return null;
  }

  return {
    accountType: status.accountType,
    subscriptionStatus: status.subscriptionStatus,
    subscriptionEndsAt: status.subscriptionEndsAt,
    nextBillingDate: status.nextBillingDate,
    plan: status.plan,
    isActive: status.isActive,
    isCanceled: status.isCanceled,
    willDowngrade: !!status.willDowngrade,
  };
}

// ============================================
// PAYMENT HISTORY
// ============================================

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  tier: AccountType;
  action: string;
  createdAt: Date;
}

/**
 * Get payment history for current user
 */
export async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      paymentHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!profile) {
    return [];
  }

  return profile.paymentHistory.map(p => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    tier: p.tier,
    action: p.action,
    createdAt: p.createdAt,
  }));
}

// ============================================
// TIER INFO
// ============================================

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Get specific plan details
 */
export async function getPlanDetails(tier: AccountType) {
  return SUBSCRIPTION_PLANS[tier] || null;
}
