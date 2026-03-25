import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const discountSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().min(0),
  currency: z.string().optional(),
  minOrderAmount: z.number().int().optional(),
  maxUses: z.number().int().optional(),
  appliesToAll: z.boolean().default(true),
  productIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const active = searchParams.get("active");

    const discounts = await db.discount.findMany({
      where: {
        ...(search && { code: { contains: search, mode: "insensitive" } }),
        ...(active === "true" && { isActive: true }),
        ...(active === "false" && { isActive: false }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: discounts });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = discountSchema.parse(body);

    const existing = await db.discount.findUnique({ where: { code: data.code } });
    if (existing)
      return NextResponse.json({ error: "Discount code already exists" }, { status: 409 });

    const discount = await db.discount.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
