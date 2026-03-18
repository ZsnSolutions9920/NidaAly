import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const [shippingZones, taxRates] = await Promise.all([
      db.shippingZone.findMany({
        include: { rates: { orderBy: { name: "asc" } } },
        orderBy: { name: "asc" },
      }),
      db.taxRate.findMany({ orderBy: { country: "asc" } }),
    ]);

    return NextResponse.json({ shippingZones, taxRates });
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

    if (body.action === "updateTaxRate") {
      const rate = await db.taxRate.update({
        where: { id: body.id },
        data: { rate: body.rate, isActive: body.isActive },
      });
      return NextResponse.json(rate);
    }

    if (body.action === "updateShippingRate") {
      const rate = await db.shippingRate.update({
        where: { id: body.id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.pricePKR !== undefined && { pricePKR: body.pricePKR }),
          ...(body.priceAED !== undefined && { priceAED: body.priceAED }),
          ...(body.priceUSD !== undefined && { priceUSD: body.priceUSD }),
          ...(body.estimatedDays !== undefined && { estimatedDays: body.estimatedDays }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      });
      return NextResponse.json(rate);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
