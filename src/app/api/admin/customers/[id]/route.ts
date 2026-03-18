import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const customer = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        locale: true,
        currency: true,
        createdAt: true,
        addresses: { orderBy: { createdAt: "desc" } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            currency: true,
            financialStatus: true,
            fulfillmentStatus: true,
            createdAt: true,
          },
        },
        _count: { select: { orders: true, wishlist: true, reviews: true } },
      },
    });

    if (!customer)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Compute lifetime value
    const ltv = await db.order.aggregate({
      _sum: { grandTotal: true },
      where: { userId: id, financialStatus: "PAID" },
    });

    return NextResponse.json({ ...customer, lifetimeValue: ltv._sum.grandTotal ?? 0 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
