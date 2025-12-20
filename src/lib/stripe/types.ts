import type { AccountType, SubscriptionStatus } from "@prisma/client";

export interface MockSubscription {
  id: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "requires_payment_method";
}

export interface SubscriptionPlan {
  tier: AccountType;
  name: string;
  price: number; // in cents
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<AccountType, SubscriptionPlan> = {
  gratis: {
    tier: "gratis",
    name: "Gratis",
    price: 0,
    features: [
      "Basis-Listing in der Suche",
      "Grundprofil anzeigen",
    ],
  },
  mittel: {
    tier: "mittel",
    name: "Basis",
    price: 2900, // 29€
    features: [
      "Profil bearbeiten",
      "3 Schwerpunkte (1 ranked)",
      "3 Bilder",
      "2 Themes",
      "Telefon & E-Mail anzeigen",
    ],
  },
  premium: {
    tier: "premium",
    name: "Premium",
    price: 7900, // 79€
    features: [
      "Alle Basis-Features",
      "8 Schwerpunkte (3 ranked)",
      "20 Bilder",
      "5 Themes + Custom",
      "Video-Intro",
      "Erweiterte Statistiken",
      "Priorität in Suchergebnissen",
      "Social Links",
      "Erstgespräch-Option",
    ],
  },
};

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export interface SubscriptionChangeResult {
  success: boolean;
  subscription?: {
    id: string;
    tier: AccountType;
    status: SubscriptionStatus;
    nextBillingDate: Date | null;
    endsAt: Date | null;
  };
  error?: string;
}

export type SubscriptionAction = "upgrade" | "downgrade" | "renew" | "cancel";
