import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

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
  return getStripe().paymentIntents.create({
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
  return getStripe().paymentIntents.retrieve(paymentIntentId);
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
  return getStripe().refunds.create({
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
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
