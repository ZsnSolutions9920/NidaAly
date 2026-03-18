"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/hooks/use-locale";

interface Product {
  id: string;
  title: string;
  slug: string;
  images: { url: string; altText: string | null }[];
  variants: { pricePKR: number; priceAED: number | null; priceUSD: number | null }[];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { locale, formatPrice } = useLocale();

  useEffect(() => {
    fetch(`/api/products?locale=${locale}&limit=4&sortBy=createdAt&sortOrder=desc`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items ?? []))
      .catch(() => {});
  }, [locale]);

  const getPrice = (product: Product) => {
    const v = product.variants[0];
    if (!v) return 0;
    if (locale === "ae" && v.priceAED) return v.priceAED;
    if (locale === "us" && v.priceUSD) return v.priceUSD;
    return v.pricePKR;
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-light-gray py-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-3">
            Curated Selection
          </p>
          <h2 className="text-2xl md:text-3xl tracking-[0.2em] uppercase font-light">
            Featured Pieces
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block">
              <div className="img-zoom aspect-[3/4] bg-white mb-4">
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
              </div>
              <h3 className="text-[13px] tracking-wider text-center group-hover:opacity-70 transition-opacity">
                {product.title}
              </h3>
              <p className="text-[13px] tracking-wider text-center text-medium-gray mt-1">
                {formatPrice(getPrice(product))}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collections/new-arrivals"
            className="inline-block border border-charcoal px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all duration-300"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
