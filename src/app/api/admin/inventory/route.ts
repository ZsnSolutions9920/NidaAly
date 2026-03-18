import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";
    const search = searchParams.get("search") ?? undefined;

    const variants = await db.productVariant.findMany({
      where: {
        trackInventory: true,
        product: { status: { not: "ARCHIVED" } },
        ...(lowStock && { inventoryQty: { lte: 5 } }),
        ...(search && {
          OR: [
            { product: { title: { contains: search, mode: "insensitive" } } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { inventoryQty: "asc" },
      include: {
        product: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    });

    return NextResponse.json({ items: variants });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    // Bulk update inventory: [{ variantId, quantity }]
    if (Array.isArray(body.updates)) {
      for (const update of body.updates) {
        await db.productVariant.update({
          where: { id: update.variantId },
          data: { inventoryQty: update.quantity },
        });
      }
      return NextResponse.json({ success: true, updated: body.updates.length });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
