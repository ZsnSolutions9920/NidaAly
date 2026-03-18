import { db } from "@/lib/db";

/**
 * Get dashboard analytics for admin
 */
export async function getDashboardAnalytics({
  startDate,
  endDate,
  locale,
}: {
  startDate?: Date;
  endDate?: Date;
  locale?: string;
} = {}) {
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  };
  const hasDateFilter = startDate || endDate;

  const [
    totalRevenue,
    totalOrders,
    paidOrders,
    topProducts,
    recentOrders,
    customerCount,
    ordersByStatus,
  ] = await Promise.all([
    // Total revenue (paid orders only)
    db.order.aggregate({
      _sum: { grandTotal: true },
      where: {
        financialStatus: "PAID",
        ...(hasDateFilter && { createdAt: dateFilter }),
        ...(locale && { locale }),
      },
    }),

    // Total orders
    db.order.count({
      where: {
        ...(hasDateFilter && { createdAt: dateFilter }),
        ...(locale && { locale }),
      },
    }),

    // Paid orders (for conversion rate)
    db.order.count({
      where: {
        financialStatus: "PAID",
        ...(hasDateFilter && { createdAt: dateFilter }),
        ...(locale && { locale }),
      },
    }),

    // Top products by quantity sold
    db.orderItem.groupBy({
      by: ["productTitle"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
      where: {
        order: {
          financialStatus: "PAID",
          ...(hasDateFilter && { createdAt: dateFilter }),
        },
      },
    }),

    // Recent orders
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        grandTotal: true,
        currency: true,
        financialStatus: true,
        fulfillmentStatus: true,
        createdAt: true,
      },
      ...(locale && { where: { locale } }),
    }),

    // Customer count
    db.user.count({ where: { role: "CUSTOMER" } }),

    // Orders grouped by status
    db.order.groupBy({
      by: ["financialStatus"],
      _count: true,
      where: {
        ...(hasDateFilter && { createdAt: dateFilter }),
        ...(locale && { locale }),
      },
    }),
  ]);

  const revenue = totalRevenue._sum.grandTotal ?? 0;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;
  const avgOrderValue = paidOrders > 0 ? revenue / paidOrders : 0;

  return {
    revenue,
    totalOrders,
    paidOrders,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue),
    customerCount,
    topProducts,
    recentOrders,
    ordersByStatus,
  };
}

/**
 * Track an analytics event
 */
export async function trackEvent({
  type,
  data,
  sessionId,
  userId,
  locale,
}: {
  type: string;
  data?: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
  locale?: string;
}) {
  return db.analyticsEvent.create({
    data: { type, data: data ?? undefined, sessionId, userId, locale },
  });
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold = 5) {
  return db.productVariant.findMany({
    where: {
      trackInventory: true,
      inventoryQty: { lte: threshold },
      product: { status: "ACTIVE" },
    },
    include: {
      product: {
        select: { title: true, slug: true },
      },
    },
    orderBy: { inventoryQty: "asc" },
  });
}
