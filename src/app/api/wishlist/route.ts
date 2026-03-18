import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/wishlist - Get user's wishlist
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        // We can't include product directly since WishlistItem doesn't have a product relation
        // We'll fetch products separately
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch associated products
    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        variants: { take: 1, orderBy: { position: "asc" } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const wishlist = items.map((item) => ({
      ...item,
      product: productMap.get(item.productId),
    }));

    return NextResponse.json({ wishlist });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/wishlist - Add/remove product from wishlist (toggle)
 * Body: { productId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false });
    }

    await db.wishlistItem.create({
      data: { userId: session.user.id, productId },
    });

    return NextResponse.json({ added: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
