import { z } from "zod";

export const productVariantSchema = z.object({
  title: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  pricePKR: z.number().int().min(0),
  priceAED: z.number().int().min(0).optional(),
  priceUSD: z.number().int().min(0).optional(),
  compareAtPKR: z.number().int().min(0).optional(),
  compareAtAED: z.number().int().min(0).optional(),
  compareAtUSD: z.number().int().min(0).optional(),
  option1: z.string().optional(),
  option2: z.string().optional(),
  option3: z.string().optional(),
  inventoryQty: z.number().int().default(0),
  inventoryPolicy: z.enum(["DENY", "CONTINUE"]).default("DENY"),
  trackInventory: z.boolean().default(true),
  weight: z.number().optional(),
  weightUnit: z.string().default("g"),
  position: z.number().int().default(0),
  imageId: z.string().optional(),
});

export const productOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
  position: z.number().int().default(0),
});

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  descriptionHtml: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  productType: z.string().optional(),
  vendor: z.string().optional(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  pricePKR: z.number().int().min(0).optional(),
  priceAED: z.number().int().min(0).optional(),
  priceUSD: z.number().int().min(0).optional(),
  compareAtPKR: z.number().int().min(0).optional(),
  compareAtAED: z.number().int().min(0).optional(),
  compareAtUSD: z.number().int().min(0).optional(),
  weight: z.number().optional(),
  weightUnit: z.string().default("g"),
  options: z.array(productOptionSchema).optional(),
  variants: z.array(productVariantSchema).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        position: z.number().int().default(0),
      })
    )
    .optional(),
  collectionIds: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
