"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocale } from "@/hooks/use-locale";

interface Product {
  id: string;
  title: string;
  slug: string;
  pricePKR: number | null;
  priceAED: number | null;
  priceUSD: number | null;
  compareAtPKR: number | null;
  images: { url: string; altText: string | null }[];
  variants: { pricePKR: number; priceAED: number | null; priceUSD: number | null; inventoryQty: number }[];
}

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { locale, formatPrice } = useLocale();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        collection: slug,
        locale,
        sortBy,
        sortOrder,
        limit: "40",
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.items ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug, locale, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getPrice = (product: Product) => {
    const v = product.variants[0];
    if (!v) return product.pricePKR ?? 0;
    if (locale === "ae" && v.priceAED) return v.priceAED;
    if (locale === "us" && v.priceUSD) return v.priceUSD;
    return v.pricePKR;
  };

  const handleSort = (value: string) => {
    switch (value) {
      case "price-asc":
        setSortBy("pricePKR");
        setSortOrder("asc");
        break;
      case "price-desc":
        setSortBy("pricePKR");
        setSortOrder("desc");
        break;
      case "newest":
        setSortBy("createdAt");
        setSortOrder("desc");
        break;
      case "oldest":
        setSortBy("createdAt");
        setSortOrder("asc");
        break;
      default:
        setSortBy("createdAt");
        setSortOrder("desc");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 text-[12px] tracking-wider text-medium-gray">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{title}</span>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-light">{title}</h1>
        {!loading && (
          <p className="text-[13px] text-medium-gray tracking-wider mt-3">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <p className="text-[11px] tracking-[0.2em] uppercase text-medium-gray">
          {products.length} results
        </p>
        <select
          onChange={(e) => handleSort(e.target.value)}
          className="text-[11px] tracking-[0.2em] uppercase bg-transparent outline-none cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-light-gray animate-pulse mb-4" />
              <div className="h-4 bg-light-gray animate-pulse w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-light-gray animate-pulse w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-medium-gray mb-4">No products found in this collection.</p>
          <Link href="/" className="text-sm underline hover:text-gold">Browse all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const price = getPrice(product);
            const soldOut = product.variants.every((v) => v.inventoryQty === 0);

            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="img-zoom aspect-[3/4] bg-light-gray mb-4 relative">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.title}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-medium-gray text-sm">No image</div>
                  )}
                  {soldOut && (
                    <div className="absolute top-3 left-3 bg-charcoal text-white text-[10px] tracking-wider px-3 py-1 uppercase">
                      Sold Out
                    </div>
                  )}
                </div>
                <h3 className="text-[13px] tracking-wider text-center group-hover:opacity-70 transition-opacity">
                  {product.title}
                </h3>
                <p className="text-[13px] tracking-wider text-center text-medium-gray mt-1">
                  {formatPrice(price)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
