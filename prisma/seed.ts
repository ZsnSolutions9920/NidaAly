import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nidaaly.com" },
    update: { passwordHash: adminPassword },
    create: {
      email: "admin@nidaaly.com",
      passwordHash: adminPassword,
      firstName: "Nida",
      lastName: "Aly",
      role: "SUPER_ADMIN",
      locale: "pk",
      currency: "PKR",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create collections
  const collections = await Promise.all([
    prisma.collection.upsert({
      where: { slug: "new-arrivals" },
      update: {},
      create: {
        title: "New Arrivals",
        slug: "new-arrivals",
        description: "Our latest designs, fresh off the atelier.",
        imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
        position: 0,
      },
    }),
    prisma.collection.upsert({
      where: { slug: "bridals" },
      update: {},
      create: {
        title: "Bridals",
        slug: "bridals",
        description: "Exquisite bridal couture for your special day.",
        imageUrl: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800",
        position: 1,
      },
    }),
    prisma.collection.upsert({
      where: { slug: "luxury-formals" },
      update: {},
      create: {
        title: "Luxury Formals",
        slug: "luxury-formals",
        description: "Elegant formal wear for every occasion.",
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
        position: 2,
      },
    }),
    prisma.collection.upsert({
      where: { slug: "pret" },
      update: {},
      create: {
        title: "Pret",
        slug: "pret",
        description: "Ready-to-wear collections with effortless style.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
        position: 3,
      },
    }),
  ]);
  console.log("Collections created:", collections.length);

  // Create sample products
  const products = [
    {
      title: "Crimson Bridal Lehenga",
      slug: "crimson-bridal-lehenga",
      description: "A magnificent crimson bridal lehenga featuring intricate hand-embroidered zardozi work, crystal embellishments, and a flowing organza dupatta.",
      status: "ACTIVE" as const,
      productType: "Bridal Lehenga",
      vendor: "NidaAly",
      tags: ["bridal", "lehenga", "wedding", "red", "embroidered"],
      pricePKR: 35000000, // ₨350,000
      priceAED: 460000,   // AED 4,600
      priceUSD: 125000,   // $1,250
      compareAtPKR: 42000000,
      publishedAt: new Date(),
      collectionSlug: "bridals",
    },
    {
      title: "Ivory Pearl Formal Gown",
      slug: "ivory-pearl-formal-gown",
      description: "An ethereal ivory gown adorned with hand-sewn pearl clusters and delicate lacework. Perfect for formal events and galas.",
      status: "ACTIVE" as const,
      productType: "Formal Gown",
      vendor: "NidaAly",
      tags: ["formal", "gown", "ivory", "pearls", "luxury"],
      pricePKR: 18500000, // ₨185,000
      priceAED: 245000,   // AED 2,450
      priceUSD: 67500,    // $675
      publishedAt: new Date(),
      collectionSlug: "luxury-formals",
    },
    {
      title: "Sage Green Pret Kurta",
      slug: "sage-green-pret-kurta",
      description: "A contemporary sage green kurta in premium lawn fabric with minimalist thread embroidery and modern silhouette.",
      status: "ACTIVE" as const,
      productType: "Pret Kurta",
      vendor: "NidaAly",
      tags: ["pret", "kurta", "green", "lawn", "casual"],
      pricePKR: 1250000, // ₨12,500
      priceAED: 17000,   // AED 170
      priceUSD: 4500,    // $45
      publishedAt: new Date(),
      collectionSlug: "pret",
    },
    {
      title: "Midnight Blue Velvet Shawl",
      slug: "midnight-blue-velvet-shawl",
      description: "Luxurious midnight blue velvet shawl with gold tilla embroidery, perfect for winter formals and evening events.",
      status: "ACTIVE" as const,
      productType: "Shawl",
      vendor: "NidaAly",
      tags: ["shawl", "velvet", "blue", "winter", "formal"],
      pricePKR: 4500000, // ₨45,000
      priceAED: 60000,   // AED 600
      priceUSD: 16500,   // $165
      publishedAt: new Date(),
      collectionSlug: "luxury-formals",
    },
    {
      title: "Rose Gold Bridal Gharara",
      slug: "rose-gold-bridal-gharara",
      description: "A stunning rose gold gharara set with sequin work, dabka embroidery, and a heavily embellished dupatta for the modern bride.",
      status: "ACTIVE" as const,
      productType: "Bridal Gharara",
      vendor: "NidaAly",
      tags: ["bridal", "gharara", "rose-gold", "wedding", "embroidered"],
      pricePKR: 28000000, // ₨280,000
      priceAED: 370000,   // AED 3,700
      priceUSD: 100000,   // $1,000
      publishedAt: new Date(),
      collectionSlug: "bridals",
    },
    {
      title: "Black Silk Pret Set",
      slug: "black-silk-pret-set",
      description: "Elegant black raw silk 2-piece pret set with self-print and tasseled hem details. Versatile for both day and evening wear.",
      status: "ACTIVE" as const,
      productType: "Pret Set",
      vendor: "NidaAly",
      tags: ["pret", "silk", "black", "2-piece", "versatile"],
      pricePKR: 1850000, // ₨18,500
      priceAED: 25000,   // AED 250
      priceUSD: 6700,    // $67
      publishedAt: new Date(),
      collectionSlug: "pret",
    },
  ];

  for (const productData of products) {
    const { collectionSlug, ...data } = productData;
    const collection = collections.find((c) => c.slug === collectionSlug);

    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        seoTitle: data.title + " | NidaAly",
        images: {
          create: [
            {
              url: `https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop`,
              altText: data.title,
              position: 0,
            },
            {
              url: `https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop`,
              altText: `${data.title} - Detail`,
              position: 1,
            },
          ],
        },
        options: {
          create: [
            { name: "Size", values: ["XS", "S", "M", "L", "XL"], position: 0 },
            ...(data.productType?.includes("Bridal")
              ? [{ name: "Color", values: ["As Shown", "Custom"], position: 1 }]
              : []),
          ],
        },
        variants: {
          create: ["XS", "S", "M", "L", "XL"].map((size, i) => ({
            title: size,
            sku: `${data.slug}-${size}`.toUpperCase(),
            pricePKR: data.pricePKR,
            priceAED: data.priceAED,
            priceUSD: data.priceUSD,
            compareAtPKR: data.compareAtPKR,
            option1: size,
            inventoryQty: Math.floor(Math.random() * 10) + 2,
            position: i,
          })),
        },
        ...(collection && {
          collections: {
            create: { collectionId: collection.id, position: 0 },
          },
        }),
      },
    });
    console.log("Product created:", product.title);
  }

  // Create shipping zones and rates
  const zones = [
    {
      name: "Pakistan",
      countries: ["PK"],
      rates: [
        {
          name: "Standard Shipping",
          pricePKR: 50000, // ₨500
          priceAED: 0,
          priceUSD: 0,
          estimatedDays: "3-5 business days",
        },
        {
          name: "Express Shipping",
          pricePKR: 150000, // ₨1,500
          priceAED: 0,
          priceUSD: 0,
          estimatedDays: "1-2 business days",
        },
        {
          name: "Free Shipping (Orders over ₨50,000)",
          pricePKR: 0,
          priceAED: 0,
          priceUSD: 0,
          minOrderAmount: 5000000,
          estimatedDays: "5-7 business days",
        },
      ],
    },
    {
      name: "UAE",
      countries: ["AE"],
      rates: [
        {
          name: "Standard International",
          pricePKR: 0,
          priceAED: 7500, // AED 75
          priceUSD: 0,
          estimatedDays: "7-10 business days",
        },
        {
          name: "Express International",
          pricePKR: 0,
          priceAED: 15000, // AED 150
          priceUSD: 0,
          estimatedDays: "3-5 business days",
        },
      ],
    },
    {
      name: "USA",
      countries: ["US"],
      rates: [
        {
          name: "Standard International",
          pricePKR: 0,
          priceAED: 0,
          priceUSD: 2500, // $25
          estimatedDays: "10-14 business days",
        },
        {
          name: "Express International",
          pricePKR: 0,
          priceAED: 0,
          priceUSD: 5000, // $50
          estimatedDays: "5-7 business days",
        },
      ],
    },
  ];

  for (const zoneData of zones) {
    const { rates, ...zone } = zoneData;
    const created = await prisma.shippingZone.create({
      data: {
        ...zone,
        rates: { create: rates },
      },
    });
    console.log("Shipping zone created:", created.name);
  }

  // Create tax rates
  await Promise.all([
    prisma.taxRate.upsert({
      where: { country_province: { country: "PK", province: "" } },
      update: {},
      create: {
        name: "Pakistan GST",
        country: "PK",
        province: "",
        rate: 0.17,
      },
    }),
    prisma.taxRate.upsert({
      where: { country_province: { country: "AE", province: "" } },
      update: {},
      create: {
        name: "UAE VAT",
        country: "AE",
        province: "",
        rate: 0.05,
      },
    }),
    prisma.taxRate.upsert({
      where: { country_province: { country: "US", province: "" } },
      update: {},
      create: {
        name: "US (No Federal Sales Tax)",
        country: "US",
        province: "",
        rate: 0.0,
      },
    }),
  ]);
  console.log("Tax rates created");

  // Create sample discount
  await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      appliesToAll: true,
      isActive: true,
      maxUses: 1000,
    },
  });
  console.log("Discount code created: WELCOME10");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
