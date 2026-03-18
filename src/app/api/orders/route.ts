import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/orders - Get current user's order history
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productTitle: true,
            variantTitle: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            productImageUrl: true,
          },
        },
        shippingAddress: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
