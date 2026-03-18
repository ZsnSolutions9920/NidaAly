import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createFulfillment } from "@/services/order.service";
import { createRefund } from "@/lib/stripe";
import { db } from "@/lib/db";

/**
 * GET /api/admin/orders/[id] - Get order details
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { title: true, slug: true } } },
            },
          },
        },
        user: { select: { firstName: true, lastName: true, email: true } },
        shippingAddress: true,
        billingAddress: true,
        fulfillments: { include: { items: true } },
        refunds: true,
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders/[id] - Update order (fulfillment, status, refund)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    // Handle different update actions
    switch (body.action) {
      case "fulfill": {
        const fulfillment = await createFulfillment({
          orderId: id,
          itemIds: body.itemIds,
          trackingNumber: body.trackingNumber,
          trackingUrl: body.trackingUrl,
          trackingCompany: body.trackingCompany,
        });
        return NextResponse.json(fulfillment);
      }

      case "cancel": {
        const order = await db.order.update({
          where: { id },
          data: {
            orderStatus: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
        await db.orderEvent.create({
          data: { orderId: id, type: "cancelled", message: "Order cancelled by admin" },
        });
        return NextResponse.json(order);
      }

      case "refund": {
        const order = await db.order.findUnique({ where: { id } });
        if (!order?.stripePaymentIntentId) {
          return NextResponse.json(
            { error: "No payment to refund" },
            { status: 400 }
          );
        }

        const stripeRefund = await createRefund({
          paymentIntentId: order.stripePaymentIntentId,
          amount: body.amount,
          reason: body.reason,
        });

        const refund = await db.refund.create({
          data: {
            orderId: id,
            amount: body.amount ?? order.grandTotal,
            currency: order.currency,
            reason: body.reason,
            note: body.note,
            stripeRefundId: stripeRefund.id,
          },
        });

        // Update order financial status
        const totalRefunded = await db.refund.aggregate({
          _sum: { amount: true },
          where: { orderId: id },
        });

        const isFullRefund =
          (totalRefunded._sum.amount ?? 0) >= order.grandTotal;

        await db.order.update({
          where: { id },
          data: {
            financialStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
          },
        });

        await db.orderEvent.create({
          data: {
            orderId: id,
            type: "refunded",
            message: `Refund of ${body.amount ?? order.grandTotal} ${order.currency} processed`,
          },
        });

        return NextResponse.json(refund);
      }

      case "add_note": {
        await db.order.update({
          where: { id },
          data: { internalNote: body.note },
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
