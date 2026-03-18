"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/hooks/use-locale";
import { useCart } from "@/hooks/use-cart";

interface WishlistProduct {
  id: string;
  productId: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    images: { url: string }[];
    variants: { id: string; pricePKR: number; priceAED: number | null; priceUSD: number | null; inventoryQty: number }[];
  };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale, formatPrice } = useLocale();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account/wishlist");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => setItems(data.wishlist ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const removeFromWishlist = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleAddToCart = async (item: WishlistProduct) => {
    const variant = item.product?.variants[0];
    if (!variant) return;
    await addToCart(variant.id, 1);
  };

  const getPrice = (variants: WishlistProduct["product"] extends undefined ? never : NonNullable<WishlistProduct["product"]>["variants"]) => {
    const v = variants[0];
    if (!v) return 0;
    if (locale === "ae" && v.priceAED) return v.priceAED;
    if (locale === "us" && v.priceUSD) return v.priceUSD;
    return v.pricePKR;
  };

  if (status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center text-medium-gray">Loading...</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl tracking-[0.15em] uppercase font-light">My Wishlist</h1>
        <Link href="/account" className="text-sm text-medium-gray hover:text-charcoal transition-colors">
          &larr; Back to Account
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-light-gray animate-pulse mb-4" />
              <div className="h-4 bg-light-gray animate-pulse w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-medium-gray mb-4">Your wishlist is empty.</p>
          <Link href="/" className="inline-block border border-charcoal px-8 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            if (!item.product) return null;
            const product = item.product;
            const inStock = product.variants.some((v) => v.inventoryQty > 0);

            return (
              <div key={item.id} className="group relative">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="img-zoom aspect-[3/4] bg-light-gray mb-4">
                    {product.images[0] && (
                      <Image src={product.images[0].url} alt={product.title} width={400} height={533} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="text-[13px] tracking-wider text-center group-hover:opacity-70 transition-opacity">
                    {product.title}
                  </h3>
                  <p className="text-[13px] tracking-wider text-center text-medium-gray mt-1">
                    {formatPrice(getPrice(product.variants))}
                  </p>
                </Link>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!inStock}
                    className="flex-1 bg-charcoal text-white py-2 text-[10px] tracking-[0.15em] uppercase hover:bg-gold transition-colors disabled:opacity-50"
                  >
                    {inStock ? "Add to Bag" : "Sold Out"}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="px-3 border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
