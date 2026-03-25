import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createOrder, getShippingRates } from "@/services/order.service";
import { getOrCreateCart } from "@/services/cart.service";
import type { LocaleCode } from "@/lib/locale";
import { z } from "zod";

/**
 * POST /api/checkout - Create order and payment intent
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;

    const body = await req.json();
    const checkout = checkoutSchema.parse(body);
    const locale = checkout.locale as LocaleCode;
    const currencyMap = { pk: "PKR", ae: "AED", us: "USD" };

    // Auto-select shipping rate if not provided
    if (!checkout.shippingRateId) {
      const country = checkout.shippingAddress.country;
      const rates = await getShippingRates(country);
      if (rates.length > 0) {
        checkout.shippingRateId = rates[0].id;
      }
    }

    // Get the cart
    const cart = await getOrCreateCart({
      userId: session?.user?.id,
      sessionId,
      locale,
      currency: currencyMap[locale],
    });

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create order + payment intent
    const result = await createOrder({
      checkout,
      cartId: cart.id,
      userId: session?.user?.id,
      locale,
    });

    return NextResponse.json({
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      clientSecret: result.clientSecret,
      grandTotal: result.order.grandTotal,
      currency: result.order.currency,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/checkout error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/checkout?country=PK - Get shipping rates
 */
export async function GET(req: NextRequest) {
  try {
    const country = req.nextUrl.searchParams.get("country") ?? "PK";
    const rates = await getShippingRates(country);
    return NextResponse.json({ rates });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
