"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useLocale } from "@/hooks/use-locale";
import { useSession } from "next-auth/react";

interface ProductData {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    productType: string | null;
    tags: string[];
    pricePKR: number | null;
    priceAED: number | null;
    priceUSD: number | null;
    compareAtPKR: number | null;
    compareAtAED: number | null;
    compareAtUSD: number | null;
    images: { id: string; url: string; altText: string | null; position: number }[];
    variants: {
      id: string;
      title: string;
      sku: string | null;
      pricePKR: number;
      priceAED: number | null;
      priceUSD: number | null;
      compareAtPKR: number | null;
      compareAtAED: number | null;
      compareAtUSD: number | null;
      option1: string | null;
      option2: string | null;
      option3: string | null;
      inventoryQty: number;
      image: { url: string } | null;
    }[];
    options: { id: string; name: string; values: string[] }[];
    reviews: { id: string; rating: number; title: string | null; body: string | null; user: { firstName: string | null; lastName: string | null } }[];
    collections: { collection: { title: string; slug: string } }[];
  };
  related: {
    id: string;
    title: string;
    slug: string;
    images: { url: string }[];
    variants: { pricePKR: number; priceAED: number | null; priceUSD: number | null }[];
  }[];
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart, isUpdating } = useCart();
  const { locale, formatPrice } = useLocale();
  const { data: session } = useSession();

  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addedMessage, setAddedMessage] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Fetch product data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        // Pre-select first option values
        if (d.product?.options) {
          const defaults: Record<string, string> = {};
          d.product.options.forEach((opt: { name: string; values: string[] }) => {
            if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
          });
          setSelectedOptions(defaults);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!data?.product) return null;
    const options = data.product.options;
    return data.product.variants.find((v) => {
      if (options.length >= 1 && v.option1 !== selectedOptions[options[0]?.name]) return false;
      if (options.length >= 2 && v.option2 !== selectedOptions[options[1]?.name]) return false;
      if (options.length >= 3 && v.option3 !== selectedOptions[options[2]?.name]) return false;
      return true;
    }) ?? data.product.variants[0] ?? null;
  }, [data, selectedOptions]);

  // Get price for current locale
  const getPrice = (item: { pricePKR: number; priceAED?: number | null; priceUSD?: number | null }) => {
    if (locale === "ae" && item.priceAED) return item.priceAED;
    if (locale === "us" && item.priceUSD) return item.priceUSD;
    return item.pricePKR;
  };

  const getComparePrice = (item: { compareAtPKR?: number | null; compareAtAED?: number | null; compareAtUSD?: number | null }) => {
    if (locale === "ae" && item.compareAtAED) return item.compareAtAED;
    if (locale === "us" && item.compareAtUSD) return item.compareAtUSD;
    return item.compareAtPKR ?? null;
  };

  // Check if option value is available (has inventory)
  const isOptionAvailable = (optionName: string, value: string) => {
    if (!data?.product) return false;
    const options = data.product.options;
    const optionIndex = options.findIndex((o) => o.name === optionName);

    return data.product.variants.some((v) => {
      const optField = optionIndex === 0 ? v.option1 : optionIndex === 1 ? v.option2 : v.option3;
      return optField === value && v.inventoryQty > 0;
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart(selectedVariant.id, 1);
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(`/products/${slug}`);
      return;
    }
    if (!data?.product) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: data.product.id }),
      });
      const result = await res.json();
      setWishlisted(result.added);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="aspect-[3/4] bg-light-gray animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-light-gray animate-pulse w-3/4" />
            <div className="h-6 bg-light-gray animate-pulse w-1/4" />
            <div className="h-40 bg-light-gray animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-light tracking-wider mb-4">Product Not Found</h1>
        <Link href="/" className="text-sm underline hover:text-gold">Back to Home</Link>
      </div>
    );
  }

  const { product, related } = data;
  const images = product.images.length > 0 ? product.images : [{ id: "ph", url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80", altText: product.title, position: 0 }];
  const price = selectedVariant ? getPrice(selectedVariant) : null;
  const comparePrice = selectedVariant ? getComparePrice(selectedVariant) : null;
  const inStock = selectedVariant ? selectedVariant.inventoryQty > 0 : false;
  const avgRating = product.reviews.length > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 text-[12px] tracking-wider text-medium-gray">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span className="mx-2">/</span>
        {product.collections[0] && (
          <>
            <Link href={`/collections/${product.collections[0].collection.slug}`} className="hover:text-charcoal transition-colors">
              {product.collections[0].collection.title}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-charcoal">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] bg-light-gray mb-4 overflow-hidden">
            <Image
              src={images[selectedImage]?.url}
              alt={images[selectedImage]?.altText ?? product.title}
              width={800}
              height={1067}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-[3/4] bg-light-gray border-2 transition-colors overflow-hidden ${
                    i === selectedImage ? "border-charcoal" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt={img.altText ?? ""} width={200} height={267} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:pt-8">
          <h1 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-2">
            {product.title}
          </h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-sm ${star <= Math.round(avgRating) ? "text-gold" : "text-gray-200"}`}>
                    &#9733;
                  </span>
                ))}
              </div>
              <span className="text-xs text-medium-gray">({product.reviews.length})</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            {price !== null && (
              <p className="text-xl tracking-wider">{formatPrice(price)}</p>
            )}
            {comparePrice && comparePrice > (price ?? 0) && (
              <p className="text-lg tracking-wider text-medium-gray line-through">{formatPrice(comparePrice)}</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-8 space-y-8">
            {/* Option Selection (Size, Color, etc.) */}
            {product.options.map((option) => (
              <div key={option.id}>
                <p className="text-[11px] tracking-[0.2em] uppercase mb-4">
                  {option.name}: <span className="font-medium">{selectedOptions[option.name]}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {option.values.map((value) => {
                    const available = isOptionAvailable(option.name, value);
                    return (
                      <button
                        key={value}
                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                        disabled={!available}
                        className={`min-w-[48px] h-12 px-3 border text-[12px] tracking-wider transition-all ${
                          selectedOptions[option.name] === value
                            ? "border-charcoal bg-charcoal text-white"
                            : available
                              ? "border-gray-200 hover:border-charcoal"
                              : "border-gray-100 text-gray-300 line-through cursor-not-allowed"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Stock indicator */}
            {selectedVariant && (
              <p className={`text-xs tracking-wider ${inStock ? "text-green-600" : "text-red-500"}`}>
                {inStock
                  ? selectedVariant.inventoryQty <= 5
                    ? `Only ${selectedVariant.inventoryQty} left in stock`
                    : "In Stock"
                  : "Out of Stock"}
              </p>
            )}

            {/* Add to Bag + Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || isUpdating}
                className="flex-1 bg-charcoal text-white py-4 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addedMessage ? "Added to Bag!" : isUpdating ? "Adding..." : inStock ? "Add to Bag" : "Sold Out"}
              </button>
              <button
                onClick={toggleWishlist}
                className="w-14 h-14 border border-gray-200 flex items-center justify-center hover:border-charcoal transition-colors"
                aria-label="Add to wishlist"
              >
                <svg className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">Description</h3>
                <div className="text-[14px] leading-relaxed text-medium-gray">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {/* Details Accordion */}
            <div className="border-t border-gray-100 pt-8 space-y-4">
              {["Fabric & Care", "Shipping & Returns", "Size Guide"].map((item) => (
                <details key={item} className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-[11px] tracking-[0.2em] uppercase py-3 border-b border-gray-100">
                    {item}
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-4 pb-2 text-[13px] text-medium-gray leading-relaxed">
                    <p>Premium quality fabrics. Dry clean only. Please refer to the care label for detailed instructions. Free shipping on all domestic orders. International shipping available.</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-center text-xl tracking-[0.2em] uppercase font-light mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                <div className="img-zoom aspect-[3/4] bg-light-gray mb-4">
                  {item.images[0] && (
                    <Image src={item.images[0].url} alt={item.title} width={400} height={533} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="text-[13px] tracking-wider text-center group-hover:opacity-70 transition-opacity">{item.title}</h3>
                <p className="text-[13px] tracking-wider text-center text-medium-gray mt-1">
                  {formatPrice(getPrice(item.variants[0] ?? { pricePKR: 0 }))}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
