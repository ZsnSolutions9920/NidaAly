import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/search?q=bridal&locale=pk
 * Full-text search across products, collections
 */
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q");
    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], collections: [] });
    }

    const [products, collections] = await Promise.all([
      db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query.toLowerCase()] } },
            { productType: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          pricePKR: true,
          priceAED: true,
          priceUSD: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
      }),
      db.collection.findMany({
        where: {
          isVisible: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, title: true, slug: true, imageUrl: true },
      }),
    ]);

    return NextResponse.json({ products, collections });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
