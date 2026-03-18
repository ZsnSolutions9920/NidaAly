import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDashboardAnalytics, getLowStockProducts } from "@/services/analytics.service";

/**
 * GET /api/admin/analytics - Dashboard metrics
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const locale = searchParams.get("locale") ?? undefined;

    const [analytics, lowStock] = await Promise.all([
      getDashboardAnalytics({ startDate, endDate, locale }),
      getLowStockProducts(),
    ]);

    return NextResponse.json({ ...analytics, lowStock });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
