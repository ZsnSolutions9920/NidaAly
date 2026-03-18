import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { handlePaymentSuccess, handlePaymentFailure } from "@/services/order.service";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Key events:
 * - payment_intent.succeeded -> Mark order as PAID, decrement inventory
 * - payment_intent.payment_failed -> Mark order as VOIDED
 * - charge.refunded -> Handle refund
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent.id);
        console.log(`Payment succeeded for ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await handlePaymentFailure(paymentIntent.id);
        console.log(`Payment failed for ${paymentIntent.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        console.log(`Charge refunded: ${charge.id}`);
        // Refund handling is done through admin API, webhook is for confirmation
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
