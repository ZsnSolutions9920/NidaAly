import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const collectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  imageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.string().default("MANUAL"),
  isVisible: z.boolean().default(true),
  position: z.number().int().default(0),
  productIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;

    const collections = await db.collection.findMany({
      where: search
        ? { title: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { position: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ items: collections });
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
    const data = collectionSchema.parse(body);

    let slug = slugify(data.title, { lower: true, strict: true });
    const existing = await db.collection.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const { productIds, ...collectionData } = data;

    const collection = await db.collection.create({
      data: {
        ...collectionData,
        slug,
        seoTitle: data.seoTitle ?? data.title,
        ...(productIds?.length && {
          products: {
            create: productIds.map((productId, i) => ({
              productId,
              position: i,
            })),
          },
        }),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("POST /api/admin/collections error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
