import { db } from "@/lib/db";
import { createPaymentIntent } from "@/lib/stripe";
import type { CheckoutInput } from "@/lib/validations/checkout";
import type { LocaleCode } from "@/lib/locale";

/**
 * Generate unique order number: NA-10001, NA-10002, ...
 */
async function generateOrderNumber(): Promise<string> {
  const lastOrder = await db.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  const lastNum = lastOrder
    ? parseInt(lastOrder.orderNumber.split("-")[1], 10)
    : 10000;

  return `NA-${lastNum + 1}`;
}

/**
 * Calculate shipping cost based on zone and rate
 */
export async function getShippingRates(country: string) {
  const zone = await db.shippingZone.findFirst({
    where: { countries: { has: country } },
    include: { rates: { where: { isActive: true } } },
  });

  return zone?.rates ?? [];
}

/**
 * Calculate tax based on country
 */
export async function calculateTax(
  country: string,
  province: string | undefined,
  subtotal: number
): Promise<{ taxRate: number; taxAmount: number }> {
  const taxRate = await db.taxRate.findFirst({
    where: {
      country,
      isActive: true,
      ...(province && { province }),
    },
  });

  if (!taxRate) return { taxRate: 0, taxAmount: 0 };

  return {
    taxRate: taxRate.rate,
    taxAmount: Math.round(subtotal * taxRate.rate),
  };
}

/**
 * Validate and apply discount code
 */
export async function validateDiscount(
  code: string,
  subtotal: number,
  productIds: string[]
) {
  const discount = await db.discount.findUnique({ where: { code } });

  if (!discount) return { valid: false, error: "Invalid discount code" };
  if (!discount.isActive) return { valid: false, error: "Discount code is inactive" };
  if (discount.endsAt && discount.endsAt < new Date())
    return { valid: false, error: "Discount code has expired" };
  if (discount.maxUses && discount.usedCount >= discount.maxUses)
    return { valid: false, error: "Discount code usage limit reached" };
  if (discount.minOrderAmount && subtotal < discount.minOrderAmount)
    return {
      valid: false,
      error: `Minimum order amount not met`,
    };

  // Check product applicability
  if (!discount.appliesToAll && discount.productIds.length > 0) {
    const hasApplicable = productIds.some((id) => discount.productIds.includes(id));
    if (!hasApplicable)
      return { valid: false, error: "Discount not applicable to these products" };
  }

  let discountAmount = 0;
  if (discount.type === "PERCENTAGE") {
    discountAmount = Math.round(subtotal * (discount.value / 100));
  } else if (discount.type === "FIXED") {
    discountAmount = Math.round(discount.value);
  }
  // FREE_SHIPPING is handled separately in shipping calculation

  return {
    valid: true,
    discount,
    discountAmount,
    type: discount.type,
  };
}

/**
 * Create an order from checkout data + cart
 * This creates the order BEFORE payment (Shopify pattern)
 */
export async function createOrder({
  checkout,
  cartId,
  userId,
  locale = "pk",
}: {
  checkout: CheckoutInput;
  cartId: string;
  userId?: string;
  locale?: LocaleCode;
}) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { position: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const currency = checkout.currency;
  const priceKey = locale === "ae" ? "priceAED" : locale === "us" ? "priceUSD" : "pricePKR";

  // Calculate subtotal
  let subtotal = 0;
  const orderItemsData = cart.items.map((item) => {
    const price = (item.variant as Record<string, unknown>)[priceKey] as number ?? item.variant.pricePKR;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    return {
      variantId: item.variant.id,
      productTitle: item.variant.product.title,
      variantTitle: item.variant.title,
      sku: item.variant.sku,
      quantity: item.quantity,
      unitPrice: price,
      totalPrice: lineTotal,
      currency,
      productImageUrl: item.variant.product.images[0]?.url,
    };
  });

  // Get shipping rate
  const shippingRate = checkout.shippingRateId
    ? await db.shippingRate.findUnique({
        where: { id: checkout.shippingRateId },
      })
    : null;
  const shippingPriceKey =
    locale === "ae" ? "priceAED" : locale === "us" ? "priceUSD" : "pricePKR";
  const shippingTotal = shippingRate
    ? (shippingRate as Record<string, unknown>)[shippingPriceKey] as number ?? 0
    : 0;

  // Calculate tax
  const { taxAmount } = await calculateTax(
    checkout.shippingAddress.country,
    checkout.shippingAddress.province ?? undefined,
    subtotal
  );

  // Apply discount
  let discountTotal = 0;
  if (checkout.discountCode) {
    const productIds = cart.items.map((item) => item.variant.product.id);
    const discountResult = await validateDiscount(
      checkout.discountCode,
      subtotal,
      productIds
    );
    if (discountResult.valid && discountResult.discountAmount) {
      discountTotal = discountResult.discountAmount;
    }
  }

  const grandTotal = subtotal + shippingTotal + taxAmount - discountTotal;
  const orderNumber = await generateOrderNumber();

  // Create order in transaction
  const order = await db.$transaction(async (tx) => {
    // Create addresses
    const shippingAddr = await tx.address.create({
      data: {
        ...checkout.shippingAddress,
        userId,
      },
    });

    const billingAddr = checkout.billingAddress
      ? await tx.address.create({
          data: { ...checkout.billingAddress, userId },
        })
      : shippingAddr;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        email: checkout.email,
        phone: checkout.phone,
        currency,
        locale,
        subtotal,
        shippingTotal,
        taxTotal: taxAmount,
        discountTotal,
        grandTotal,
        discountCode: checkout.discountCode,
        note: checkout.note,
        shippingAddressId: shippingAddr.id,
        billingAddressId: billingAddr.id,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // Create order event
    await tx.orderEvent.create({
      data: {
        orderId: newOrder.id,
        type: "created",
        message: `Order ${orderNumber} created`,
      },
    });

    // Increment discount usage
    if (checkout.discountCode) {
      await tx.discount.update({
        where: { code: checkout.discountCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  // Create Stripe Payment Intent (skip if Stripe is not configured)
  const stripeConfigured =
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("your_stripe");

  if (stripeConfigured) {
    try {
      const paymentIntent = await createPaymentIntent({
        amount: grandTotal,
        currency,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      await db.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      return {
        order,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (err) {
      console.error("Stripe PaymentIntent creation failed:", err);
    }
  }

  // Dev fallback — return order without real Stripe intent
  return {
    order,
    clientSecret: `dev_secret_${order.id}`,
    paymentIntentId: `dev_pi_${order.id}`,
  };
}

/**
 * Handle successful payment (called from webhook)
 */
export async function handlePaymentSuccess(paymentIntentId: string) {
  const order = await db.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found for payment intent");

  await db.$transaction(async (tx) => {
    // Update order financial status
    await tx.order.update({
      where: { id: order.id },
      data: { financialStatus: "PAID" },
    });

    // Decrement inventory
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQty: { decrement: item.quantity } },
        });
      }
    }

    // Clear the cart
    if (order.userId) {
      const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    // Add timeline event
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: "paid",
        message: `Payment received for order ${order.orderNumber}`,
      },
    });
  });

  return order;
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(paymentIntentId: string) {
  await db.order.update({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { financialStatus: "VOIDED", orderStatus: "CANCELLED" },
  });
}

/**
 * Get orders for admin with pagination
 */
export async function getOrders({
  limit = 20,
  cursor,
  status,
  financialStatus,
  fulfillmentStatus,
  search,
}: {
  limit?: number;
  cursor?: string;
  status?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  search?: string;
} = {}) {
  const where = {
    ...(status && { orderStatus: status as "OPEN" | "CLOSED" | "CANCELLED" }),
    ...(financialStatus && { financialStatus: financialStatus as "PENDING" | "PAID" }),
    ...(fulfillmentStatus && {
      fulfillmentStatus: fulfillmentStatus as "UNFULFILLED" | "FULFILLED",
    }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const orders = await db.order.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      shippingAddress: true,
    },
  });

  const hasMore = orders.length > limit;
  const items = hasMore ? orders.slice(0, limit) : orders;

  return { items, hasMore, nextCursor: hasMore ? items[items.length - 1].id : undefined };
}

/**
 * Update order fulfillment
 */
export async function createFulfillment({
  orderId,
  itemIds,
  trackingNumber,
  trackingUrl,
  trackingCompany,
}: {
  orderId: string;
  itemIds: string[];
  trackingNumber?: string;
  trackingUrl?: string;
  trackingCompany?: string;
}) {
  return db.$transaction(async (tx) => {
    const fulfillment = await tx.fulfillment.create({
      data: {
        orderId,
        trackingNumber,
        trackingUrl,
        trackingCompany,
        status: "PENDING",
      },
    });

    // Link order items to fulfillment
    await tx.orderItem.updateMany({
      where: { id: { in: itemIds } },
      data: { fulfillmentId: fulfillment.id },
    });

    // Check if all items are fulfilled
    const unfulfilledItems = await tx.orderItem.count({
      where: { orderId, fulfillmentId: null },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: unfulfilledItems === 0 ? "FULFILLED" : "PARTIALLY_FULFILLED",
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        type: "fulfilled",
        message: `Fulfillment created${trackingNumber ? ` with tracking: ${trackingNumber}` : ""}`,
      },
    });

    return fulfillment;
  });
}
