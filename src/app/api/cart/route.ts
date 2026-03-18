import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  calculateCartTotals,
} from "@/services/cart.service";
import { v4 as uuidv4 } from "uuid";
import type { LocaleCode } from "@/lib/locale";

const CART_SESSION_COOKIE = "cart_session_id";

async function getCartIdentifiers() {
  const session = await auth();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!session?.user?.id && !sessionId) {
    sessionId = uuidv4();
  }

  return { userId: session?.user?.id, sessionId };
}

/**
 * GET /api/cart - Get current cart
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers();
    const locale = (req.nextUrl.searchParams.get("locale") as LocaleCode) ?? "pk";
    const currencyMap = { pk: "PKR", ae: "AED", us: "USD" };

    const cart = await getOrCreateCart({
      userId,
      sessionId,
      locale,
      currency: currencyMap[locale],
    });

    const totals = calculateCartTotals(cart, locale);

    const response = NextResponse.json({ cart, ...totals });

    // Set session cookie for guest users
    if (!userId && sessionId) {
      response.cookies.set(CART_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/cart - Add item to cart
 * Body: { variantId: string, quantity?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers();
    const body = await req.json();
    const locale = (body.locale as LocaleCode) ?? "pk";
    const currencyMap = { pk: "PKR", ae: "AED", us: "USD" };

    const cart = await getOrCreateCart({
      userId,
      sessionId,
      locale,
      currency: currencyMap[locale],
    });

    await addToCart({
      cartId: cart.id,
      variantId: body.variantId,
      quantity: body.quantity ?? 1,
    });

    // Refetch full cart
    const updatedCart = await getOrCreateCart({
      userId,
      sessionId,
      locale,
      currency: currencyMap[locale],
    });
    const totals = calculateCartTotals(updatedCart, locale);

    const response = NextResponse.json({ cart: updatedCart, ...totals });

    if (!userId && sessionId) {
      response.cookies.set(CART_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Insufficient") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/cart - Update cart item quantity
 * Body: { cartItemId: string, quantity: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    await updateCartItem({
      cartItemId: body.cartItemId,
      quantity: body.quantity,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/cart - Remove item from cart
 * Body: { cartItemId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    await removeFromCart(body.cartItemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
