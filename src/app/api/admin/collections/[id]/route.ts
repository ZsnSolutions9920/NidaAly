import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.string().optional(),
  isVisible: z.boolean().optional(),
  position: z.number().int().optional(),
  productIds: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const collection = await db.collection.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { position: "asc" },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                images: { take: 1, orderBy: { position: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!collection)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { productIds, ...updateData } = data;

    const collection = await db.$transaction(async (tx) => {
      const updated = await tx.collection.update({
        where: { id },
        data: updateData,
      });

      if (productIds !== undefined) {
        await tx.collectionProduct.deleteMany({ where: { collectionId: id } });
        if (productIds.length) {
          await tx.collectionProduct.createMany({
            data: productIds.map((productId, i) => ({
              collectionId: id,
              productId,
              position: i,
            })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
