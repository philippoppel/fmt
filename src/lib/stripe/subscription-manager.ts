/**
 * Subscription Manager
 *
 * Handles the business logic for subscription changes, including:
 * - Upgrades with immediate access
 * - Downgrades at period end
 * - Cancellations with grace period
 */

import { db } from "@/lib/db";
import type { AccountType, SubscriptionStatus } from "@prisma/client";
import { mockStripe, calculateProration } from "./mock-stripe";
import { SUBSCRIPTION_PLANS, type SubscriptionChangeResult, type SubscriptionAction } from "./types";

/**
 * Upgrade a therapist's subscription
 *
 * - Processes payment immediately
 * - Grants access to new tier immediately
 * - Records payment in history
 */
export async function upgradeSubscription(
  profileId: string,
  newTier: AccountType
): Promise<SubscriptionChangeResult> {
  try {
    // Get current profile
    const profile = await db.therapistProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const currentTier = profile.accountType;
    const newPlan = SUBSCRIPTION_PLANS[newTier];

    // Validate upgrade
    if (!newPlan) {
      return { success: false, error: "Invalid subscription tier" };
    }

    if (newPlan.price <= SUBSCRIPTION_PLANS[currentTier].price) {
      return { success: false, error: "Cannot upgrade to a lower or equal tier" };
    }

    // Process payment through mock Stripe
    const { subscription, payment } = await mockStripe.createSubscription(
      profileId,
      newTier
    );

    // Calculate next billing date (30 days from now)
    const now = new Date();
    const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update profile with new subscription
    await db.$transaction([
      // Update profile
      db.therapistProfile.update({
        where: { id: profileId },
        data: {
          accountType: newTier,
          subscriptionId: subscription.id,
          subscriptionStatus: "active",
          subscriptionStartedAt: now,
          subscriptionEndsAt: null,
          lastPaymentAt: now,
          nextBillingDate: nextBillingDate,
        },
      }),
      // Record payment
      db.paymentHistory.create({
        data: {
          profileId,
          amount: newPlan.price,
          currency: "eur",
          status: "succeeded",
          tier: newTier,
          action: "upgrade",
          stripePaymentId: payment.id,
        },
      }),
    ]);

    return {
      success: true,
      subscription: {
        id: subscription.id,
        tier: newTier,
        status: "active",
        nextBillingDate,
        endsAt: null,
      },
    };
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upgrade subscription",
    };
  }
}

/**
 * Downgrade a therapist's subscription
 *
 * - Takes effect at end of current billing period
 * - User keeps current tier until then
 * - No refund, just stops renewal at current price
 */
export async function downgradeSubscription(
  profileId: string,
  newTier: AccountType
): Promise<SubscriptionChangeResult> {
  try {
    const profile = await db.therapistProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    if (!profile.subscriptionId) {
      return { success: false, error: "No active subscription found" };
    }

    const currentTier = profile.accountType;
    const newPlan = SUBSCRIPTION_PLANS[newTier];
    const currentPlan = SUBSCRIPTION_PLANS[currentTier];

    // Validate downgrade
    if (newPlan.price >= currentPlan.price) {
      return { success: false, error: "Cannot downgrade to a higher or equal tier" };
    }

    // Calculate when downgrade takes effect (end of current period)
    const endsAt = profile.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update profile - keep current tier but mark as canceled
    await db.$transaction([
      db.therapistProfile.update({
        where: { id: profileId },
        data: {
          subscriptionStatus: "canceled",
          subscriptionEndsAt: endsAt,
          // Note: accountType stays the same until endsAt
        },
      }),
      // Record the downgrade action
      db.paymentHistory.create({
        data: {
          profileId,
          amount: 0, // No charge for downgrade
          currency: "eur",
          status: "succeeded",
          tier: newTier,
          action: "downgrade",
        },
      }),
    ]);

    return {
      success: true,
      subscription: {
        id: profile.subscriptionId,
        tier: currentTier, // Still current tier until endsAt
        status: "canceled",
        nextBillingDate: null,
        endsAt,
      },
    };
  } catch (error) {
    console.error("Downgrade subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to downgrade subscription",
    };
  }
}

/**
 * Cancel a subscription completely
 *
 * - User keeps access until end of billing period
 * - Then reverts to gratis tier
 */
export async function cancelSubscription(
  profileId: string
): Promise<SubscriptionChangeResult> {
  try {
    const profile = await db.therapistProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    if (profile.accountType === "gratis") {
      return { success: false, error: "No active subscription to cancel" };
    }

    // Cancel in mock Stripe
    if (profile.subscriptionId) {
      await mockStripe.cancelSubscription(profile.subscriptionId, false);
    }

    // Calculate when access ends (end of current period)
    const endsAt = profile.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update profile
    await db.$transaction([
      db.therapistProfile.update({
        where: { id: profileId },
        data: {
          subscriptionStatus: "canceled",
          subscriptionEndsAt: endsAt,
        },
      }),
      db.paymentHistory.create({
        data: {
          profileId,
          amount: 0,
          currency: "eur",
          status: "succeeded",
          tier: "gratis",
          action: "cancel",
        },
      }),
    ]);

    return {
      success: true,
      subscription: {
        id: profile.subscriptionId || "",
        tier: profile.accountType,
        status: "canceled",
        nextBillingDate: null,
        endsAt,
      },
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel subscription",
    };
  }
}

/**
 * Reactivate a canceled subscription
 *
 * - Can only be done before subscription ends
 * - Resumes billing at next period
 */
export async function reactivateSubscription(
  profileId: string
): Promise<SubscriptionChangeResult> {
  try {
    const profile = await db.therapistProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    if (profile.subscriptionStatus !== "canceled") {
      return { success: false, error: "Subscription is not canceled" };
    }

    if (profile.subscriptionEndsAt && profile.subscriptionEndsAt < new Date()) {
      return { success: false, error: "Subscription has already ended. Please start a new subscription." };
    }

    // Reactivate
    await db.therapistProfile.update({
      where: { id: profileId },
      data: {
        subscriptionStatus: "active",
        subscriptionEndsAt: null,
        nextBillingDate: profile.subscriptionEndsAt, // Resume at what was the end date
      },
    });

    return {
      success: true,
      subscription: {
        id: profile.subscriptionId || "",
        tier: profile.accountType,
        status: "active",
        nextBillingDate: profile.subscriptionEndsAt,
        endsAt: null,
      },
    };
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reactivate subscription",
    };
  }
}

/**
 * Check and apply expired subscriptions
 *
 * This would typically run as a cron job
 * Checks for subscriptions that have ended and downgrades them to gratis
 */
export async function processExpiredSubscriptions(): Promise<number> {
  const now = new Date();

  // Find all canceled subscriptions that have ended
  const expiredProfiles = await db.therapistProfile.findMany({
    where: {
      subscriptionStatus: "canceled",
      subscriptionEndsAt: {
        lt: now,
      },
      accountType: {
        not: "gratis",
      },
    },
  });

  // Downgrade each to gratis
  for (const profile of expiredProfiles) {
    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        accountType: "gratis",
        subscriptionId: null,
        subscriptionStatus: "none",
        subscriptionEndsAt: null,
        nextBillingDate: null,
      },
    });
  }

  return expiredProfiles.length;
}

/**
 * Get subscription status for a profile
 */
export async function getSubscriptionStatus(profileId: string) {
  const profile = await db.therapistProfile.findUnique({
    where: { id: profileId },
    select: {
      accountType: true,
      subscriptionId: true,
      subscriptionStatus: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true,
      lastPaymentAt: true,
      nextBillingDate: true,
    },
  });

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    plan: SUBSCRIPTION_PLANS[profile.accountType],
    isActive: profile.subscriptionStatus === "active",
    isCanceled: profile.subscriptionStatus === "canceled",
    willDowngrade: profile.subscriptionStatus === "canceled" && profile.subscriptionEndsAt,
  };
}
