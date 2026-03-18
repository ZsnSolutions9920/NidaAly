import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/services/order.service";

/**
 * GET /api/admin/orders - List orders with filtering
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const result = await getOrders({
      limit: parseInt(searchParams.get("limit") ?? "20"),
      cursor: searchParams.get("cursor") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      financialStatus: searchParams.get("financialStatus") ?? undefined,
      fulfillmentStatus: searchParams.get("fulfillmentStatus") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
