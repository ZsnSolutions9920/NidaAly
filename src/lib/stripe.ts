import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

/**
 * Map our locale currency to Stripe currency codes (lowercase)
 */
export function stripeCurrency(currency: string): string {
  return currency.toLowerCase(); // pkr, aed, usd
}

/**
 * Create a Stripe Payment Intent for an order
 */
export async function createPaymentIntent({
  amount,
  currency,
  metadata,
}: {
  amount: number; // in smallest currency unit
  currency: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount,
    currency: stripeCurrency(currency),
    metadata: metadata ?? {},
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Retrieve a Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create a refund
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  });
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

