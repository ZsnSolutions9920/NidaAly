import { db } from "@/lib/db";
import { CreateProductInput, UpdateProductInput } from "@/lib/validations/product";
import slugify from "slugify";
import type { LocaleCode } from "@/lib/locale";
import { Prisma } from "@prisma/client";

// ============================================================
// STOREFRONT QUERIES (public)
// ============================================================

export async function getProducts({
  locale = "pk",
  status = "ACTIVE",
  limit = 20,
  cursor,
  sortBy = "createdAt",
  sortOrder = "desc",
  search,
  tags,
  productType,
  minPrice,
  maxPrice,
  collectionSlug,
}: {
  locale?: LocaleCode;
  status?: string;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  tags?: string[];
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  collectionSlug?: string;
}) {
  const priceField = locale === "ae" ? "priceAED" : locale === "us" ? "priceUSD" : "pricePKR";

  const where: Prisma.ProductWhereInput = {
    status: status as "ACTIVE" | "DRAFT" | "ARCHIVED",
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ],
    }),
    ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    ...(productType && { productType }),
    ...(minPrice !== undefined && { [priceField]: { gte: minPrice } }),
    ...(maxPrice !== undefined && { [priceField]: { lte: maxPrice } }),
    ...(collectionSlug && {
      collections: {
        some: { collection: { slug: collectionSlug } },
      },
    }),
  };

  const products = await db.product.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { [sortBy]: sortOrder },
    include: {
      images: { orderBy: { position: "asc" }, take: 2 },
      variants: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          pricePKR: true,
          priceAED: true,
          priceUSD: true,
          compareAtPKR: true,
          compareAtAED: true,
          compareAtUSD: true,
          inventoryQty: true,
          option1: true,
          option2: true,
          option3: true,
        },
      },
      options: { orderBy: { position: "asc" } },
      collections: {
        include: { collection: { select: { id: true, title: true } } },
      },
    },
  });

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, limit) : products;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  return { items, nextCursor, hasMore };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: {
        orderBy: { position: "asc" },
        include: { image: true },
      },
      options: { orderBy: { position: "asc" } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      collections: {
        include: { collection: { select: { title: true, slug: true } } },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { tags: true, productType: true, collections: { select: { collectionId: true } } },
  });
  if (!product) return [];

  return db.product.findMany({
    where: {
      id: { not: productId },
      status: "ACTIVE",
      OR: [
        { tags: { hasSome: product.tags } },
        { productType: product.productType },
        {
          collections: {
            some: {
              collectionId: { in: product.collections.map((c) => c.collectionId) },
            },
          },
        },
      ],
    },
    take: limit,
    include: {
      images: { take: 1, orderBy: { position: "asc" } },
      variants: { take: 1, orderBy: { position: "asc" } },
    },
  });
}

// ============================================================
// ADMIN MUTATIONS
// ============================================================

export async function createProduct(input: CreateProductInput) {
  const slug = slugify(input.title, { lower: true, strict: true });

  // Check slug uniqueness
  const existing = await db.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  return db.$transaction(async (tx) => {
    // Create product
    const product = await tx.product.create({
      data: {
        title: input.title,
        slug: finalSlug,
        description: input.description,
        descriptionHtml: input.descriptionHtml,
        status: input.status,
        productType: input.productType,
        vendor: input.vendor,
        tags: input.tags,
        seoTitle: input.seoTitle ?? input.title,
        seoDescription: input.seoDescription,
        pricePKR: input.pricePKR,
        priceAED: input.priceAED,
        priceUSD: input.priceUSD,
        compareAtPKR: input.compareAtPKR,
        compareAtAED: input.compareAtAED,
        compareAtUSD: input.compareAtUSD,
        weight: input.weight,
        weightUnit: input.weightUnit,
        publishedAt: input.status === "ACTIVE" ? new Date() : null,
      },
    });

    // Create images
    if (input.images?.length) {
      await tx.productImage.createMany({
        data: input.images.map((img, i) => ({
          productId: product.id,
          url: img.url,
          altText: img.altText,
          position: img.position ?? i,
        })),
      });
    }

    // Create options
    if (input.options?.length) {
      await tx.productOption.createMany({
        data: input.options.map((opt, i) => ({
          productId: product.id,
          name: opt.name,
          values: opt.values,
          position: opt.position ?? i,
        })),
      });
    }

    // Create variants
    if (input.variants?.length) {
      await tx.productVariant.createMany({
        data: input.variants.map((v, i) => ({
          productId: product.id,
          title: v.title,
          sku: v.sku,
          barcode: v.barcode,
          pricePKR: v.pricePKR,
          priceAED: v.priceAED,
          priceUSD: v.priceUSD,
          compareAtPKR: v.compareAtPKR,
          compareAtAED: v.compareAtAED,
          compareAtUSD: v.compareAtUSD,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          inventoryQty: v.inventoryQty,
          inventoryPolicy: v.inventoryPolicy,
          trackInventory: v.trackInventory,
          weight: v.weight,
          weightUnit: v.weightUnit,
          position: v.position ?? i,
        })),
      });
    } else {
      // Create a default variant if none specified
      await tx.productVariant.create({
        data: {
          productId: product.id,
          title: "Default",
          pricePKR: input.pricePKR ?? 0,
          priceAED: input.priceAED,
          priceUSD: input.priceUSD,
          inventoryQty: 0,
          position: 0,
        },
      });
    }

    // Add to collections
    if (input.collectionIds?.length) {
      await tx.collectionProduct.createMany({
        data: input.collectionIds.map((collectionId, i) => ({
          collectionId,
          productId: product.id,
          position: i,
        })),
      });
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
        variants: true,
        options: true,
        collections: true,
      },
    });
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  return db.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.descriptionHtml !== undefined && { descriptionHtml: input.descriptionHtml }),
        ...(input.status && {
          status: input.status,
          publishedAt: input.status === "ACTIVE" ? new Date() : undefined,
        }),
        ...(input.productType !== undefined && { productType: input.productType }),
        ...(input.vendor !== undefined && { vendor: input.vendor }),
        ...(input.tags && { tags: input.tags }),
        ...(input.seoTitle !== undefined && { seoTitle: input.seoTitle }),
        ...(input.seoDescription !== undefined && { seoDescription: input.seoDescription }),
        ...(input.pricePKR !== undefined && { pricePKR: input.pricePKR }),
        ...(input.priceAED !== undefined && { priceAED: input.priceAED }),
        ...(input.priceUSD !== undefined && { priceUSD: input.priceUSD }),
        ...(input.compareAtPKR !== undefined && { compareAtPKR: input.compareAtPKR }),
        ...(input.compareAtAED !== undefined && { compareAtAED: input.compareAtAED }),
        ...(input.compareAtUSD !== undefined && { compareAtUSD: input.compareAtUSD }),
        ...(input.weight !== undefined && { weight: input.weight }),
        ...(input.weightUnit && { weightUnit: input.weightUnit }),
      },
    });

    // Update images if provided
    if (input.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length) {
        await tx.productImage.createMany({
          data: input.images.map((img, i) => ({
            productId: id,
            url: img.url,
            altText: img.altText,
            position: img.position ?? i,
          })),
        });
      }
    }

    // Update options if provided
    if (input.options) {
      await tx.productOption.deleteMany({ where: { productId: id } });
      if (input.options.length) {
        await tx.productOption.createMany({
          data: input.options.map((opt, i) => ({
            productId: id,
            name: opt.name,
            values: opt.values,
            position: opt.position ?? i,
          })),
        });
      }
    }

    // Update variants if provided
    if (input.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: input.variants.map((v, i) => ({
          productId: id,
          title: v.title,
          sku: v.sku,
          pricePKR: v.pricePKR,
          priceAED: v.priceAED,
          priceUSD: v.priceUSD,
          compareAtPKR: v.compareAtPKR,
          compareAtAED: v.compareAtAED,
          compareAtUSD: v.compareAtUSD,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          inventoryQty: v.inventoryQty,
          inventoryPolicy: v.inventoryPolicy,
          trackInventory: v.trackInventory,
          weight: v.weight,
          weightUnit: v.weightUnit,
          position: v.position ?? i,
        })),
      });
    }

    // Update collection assignments
    if (input.collectionIds) {
      await tx.collectionProduct.deleteMany({ where: { productId: id } });
      if (input.collectionIds.length) {
        await tx.collectionProduct.createMany({
          data: input.collectionIds.map((collectionId, i) => ({
            collectionId,
            productId: id,
            position: i,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: { images: true, variants: true, options: true, collections: true },
    });
  });
}

export async function deleteProduct(id: string) {
  return db.product.delete({ where: { id } });
}

export async function bulkUpdateProductStatus(
  ids: string[],
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
) {
  return db.product.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      publishedAt: status === "ACTIVE" ? new Date() : undefined,
    },
  });
}
