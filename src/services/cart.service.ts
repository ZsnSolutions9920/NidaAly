import { db } from "@/lib/db";
import type { LocaleCode } from "@/lib/locale";

/**
 * Get or create a cart for a user or guest session
 */
export async function getOrCreateCart({
  userId,
  sessionId,
  locale = "pk",
  currency = "PKR",
}: {
  userId?: string;
  sessionId?: string;
  locale?: LocaleCode;
  currency?: string;
}) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  // Try to find existing cart
  const existingCart = userId
    ? await db.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: { take: 1, orderBy: { position: "asc" } } },
                  },
                  image: true,
                },
              },
            },
          },
        },
      })
    : await db.cart.findUnique({
        where: { sessionId: sessionId! },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: { take: 1, orderBy: { position: "asc" } } },
                  },
                  image: true,
                },
              },
            },
          },
        },
      });

  if (existingCart) return existingCart;

  // Create new cart
  return db.cart.create({
    data: {
      userId,
      sessionId: userId ? undefined : sessionId,
      locale,
      currency,
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { position: "asc" } } },
              },
              image: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Add item to cart (or increment quantity if variant already in cart)
 */
export async function addToCart({
  cartId,
  variantId,
  quantity = 1,
}: {
  cartId: string;
  variantId: string;
  quantity?: number;
}) {
  // Verify variant exists and has inventory
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { inventoryQty: true, trackInventory: true, inventoryPolicy: true },
  });

  if (!variant) throw new Error("Variant not found");

  if (
    variant.trackInventory &&
    variant.inventoryPolicy === "DENY" &&
    variant.inventoryQty < quantity
  ) {
    throw new Error("Insufficient inventory");
  }

  // Upsert cart item
  const existing = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;

    if (
      variant.trackInventory &&
      variant.inventoryPolicy === "DENY" &&
      variant.inventoryQty < newQty
    ) {
      throw new Error("Insufficient inventory");
    }

    return db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  }

  return db.cartItem.create({
    data: { cartId, variantId, quantity },
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem({
  cartItemId,
  quantity,
}: {
  cartItemId: string;
  quantity: number;
}) {
  if (quantity <= 0) {
    return db.cartItem.delete({ where: { id: cartItemId } });
  }

  const item = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { variant: true },
  });

  if (!item) throw new Error("Cart item not found");

  if (
    item.variant.trackInventory &&
    item.variant.inventoryPolicy === "DENY" &&
    item.variant.inventoryQty < quantity
  ) {
    throw new Error("Insufficient inventory");
  }

  return db.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: string) {
  return db.cartItem.delete({ where: { id: cartItemId } });
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string) {
  return db.cartItem.deleteMany({ where: { cartId } });
}

/**
 * Merge guest cart into user cart (on login)
 */
export async function mergeGuestCart({
  guestSessionId,
  userId,
}: {
  guestSessionId: string;
  userId: string;
}) {
  const guestCart = await db.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart({
    userId,
    locale: guestCart.locale as LocaleCode,
    currency: guestCart.currency,
  });

  // Merge items
  for (const item of guestCart.items) {
    const existing = await db.cartItem.findUnique({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }

  // Delete guest cart
  await db.cart.delete({ where: { id: guestCart.id } });
}

/**
 * Calculate cart totals for a given locale
 */
export function calculateCartTotals(
  cart: Awaited<ReturnType<typeof getOrCreateCart>>,
  locale: LocaleCode
) {
  const priceKey = locale === "ae" ? "priceAED" : locale === "us" ? "priceUSD" : "pricePKR";

  let subtotal = 0;
  let itemCount = 0;

  const lineItems = cart.items.map((item) => {
    const price = (item.variant as Record<string, unknown>)[priceKey] as number ?? item.variant.pricePKR;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    itemCount += item.quantity;

    return {
      ...item,
      unitPrice: price,
      lineTotal,
    };
  });

  return { lineItems, subtotal, itemCount };
}
