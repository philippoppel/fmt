/**
 * Mock Stripe API for development and testing
 *
 * This simulates Stripe's behavior without making actual API calls.
 * In production, you would replace these with real Stripe SDK calls.
 */

import type { AccountType } from "@prisma/client";
import type { MockSubscription, MockPaymentIntent, PaymentResult } from "./types";
import { SUBSCRIPTION_PLANS } from "./types";

// Simulate network delay
const simulateNetworkDelay = () =>
  new Promise<void>(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

// Generate mock IDs that look like real Stripe IDs
const generateMockId = (prefix: string) =>
  `${prefix}_mock_${crypto.randomUUID().slice(0, 12)}`;

/**
 * Mock Stripe API
 */
export const mockStripe = {
  /**
   * Create a new subscription
   * Simulates Stripe subscription creation with payment
   */
  async createSubscription(
    profileId: string,
    tier: AccountType
  ): Promise<{ subscription: MockSubscription; payment: MockPaymentIntent }> {
    await simulateNetworkDelay();

    const plan = SUBSCRIPTION_PLANS[tier];
    if (!plan) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Simulate 5% payment failure rate for realism
    if (Math.random() < 0.05) {
      throw new Error("Payment declined. Please check your card details and try again.");
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription: MockSubscription = {
      id: generateMockId("sub"),
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    };

    const payment: MockPaymentIntent = {
      id: generateMockId("pi"),
      amount: plan.price,
      currency: "eur",
      status: "succeeded",
    };

    return { subscription, payment };
  },

  /**
   * Update an existing subscription (upgrade/downgrade)
   */
  async updateSubscription(
    subscriptionId: string,
    newTier: AccountType
  ): Promise<MockSubscription> {
    await simulateNetworkDelay();

    const plan = SUBSCRIPTION_PLANS[newTier];
    if (!plan) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    // Simulate occasional failures
    if (Math.random() < 0.02) {
      throw new Error("Unable to update subscription. Please try again.");
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: subscriptionId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    };
  },

  /**
   * Cancel a subscription
   * By default, cancels at period end (user keeps access until then)
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelImmediately: boolean = false
  ): Promise<MockSubscription> {
    await simulateNetworkDelay();

    const now = new Date();
    // If immediate cancellation, end now; otherwise end at period end (30 days from last billing)
    const periodEnd = cancelImmediately
      ? now
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: subscriptionId,
      status: "canceled",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: !cancelImmediately,
    };
  },

  /**
   * Process a one-time payment (for upgrades with prorated amount)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = "eur"
  ): Promise<MockPaymentIntent> {
    await simulateNetworkDelay();

    // Simulate 5% failure rate
    if (Math.random() < 0.05) {
      return {
        id: generateMockId("pi"),
        amount,
        currency,
        status: "failed",
      };
    }

    return {
      id: generateMockId("pi"),
      amount,
      currency,
      status: "succeeded",
    };
  },

  /**
   * Validate a mock credit card number
   * Uses simple validation for testing purposes
   */
  validateCard(cardNumber: string): boolean {
    // Accept common test card numbers
    const testCards = [
      "4242424242424242", // Visa success
      "4000000000000002", // Visa decline
      "5555555555554444", // Mastercard success
    ];

    const cleanNumber = cardNumber.replace(/\s/g, "");

    // Accept test cards or any 16-digit number for development
    return testCards.includes(cleanNumber) || /^\d{16}$/.test(cleanNumber);
  },

  /**
   * Check if a card number should be declined (for testing)
   */
  shouldDecline(cardNumber: string): boolean {
    const declineCards = [
      "4000000000000002",
      "4000000000000069",
    ];
    return declineCards.includes(cardNumber.replace(/\s/g, ""));
  },
};

/**
 * Calculate proration amount for upgrade
 * Returns the additional amount to charge in cents
 */
export function calculateProration(
  currentTier: AccountType,
  newTier: AccountType,
  daysRemaining: number
): number {
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];
  const newPlan = SUBSCRIPTION_PLANS[newTier];

  if (!currentPlan || !newPlan) {
    return 0;
  }

  // If downgrading, no proration charge
  if (newPlan.price <= currentPlan.price) {
    return 0;
  }

  // Calculate daily rate difference
  const dailyDifference = (newPlan.price - currentPlan.price) / 30;

  // Prorate for remaining days
  return Math.round(dailyDifference * daysRemaining);
}
