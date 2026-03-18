import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";
import type { LocaleCode } from "@/lib/locale";

/**
 * GET /api/products
 * Public storefront product listing with filtering, search, and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await getProducts({
      locale: (searchParams.get("locale") as LocaleCode) ?? "pk",
      status: "ACTIVE",
      limit: parseInt(searchParams.get("limit") ?? "20"),
      cursor: searchParams.get("cursor") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
      search: searchParams.get("search") ?? undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean) ?? undefined,
      productType: searchParams.get("productType") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!)
        : undefined,
      collectionSlug: searchParams.get("collection") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
