"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const productImages = [
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
];

const sizes = ["XS", "S", "M", "L", "XL"];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  const title = slug
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 text-[12px] tracking-wider text-medium-gray">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/collections/all"
          className="hover:text-charcoal transition-colors"
        >
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] bg-light-gray mb-4">
            <img
              src={productImages[selectedImage]}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-[3/4] bg-light-gray border-2 transition-colors ${
                  i === selectedImage
                    ? "border-charcoal"
                    : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={`${title} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:pt-8">
          <h1 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-4">
            {title}
          </h1>
          <p className="text-xl tracking-wider mb-8 text-medium-gray">
            ₨ 125,000
          </p>

          <div className="border-t border-gray-100 pt-8 space-y-8">
            {/* Size Selection */}
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase mb-4">
                Size
              </p>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-[12px] tracking-wider transition-all ${
                      selectedSize === size
                        ? "border-charcoal bg-charcoal text-white"
                        : "border-gray-200 hover:border-charcoal"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Bag */}
            <button className="w-full bg-charcoal text-white py-4 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal/90 transition-colors">
              Add to Bag
            </button>

            {/* Description */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">
                Description
              </h3>
              <div className="text-[14px] leading-relaxed text-medium-gray space-y-3">
                <p>
                  This exquisite piece features intricate hand-embroidery with
                  delicate thread work and embellishments. Crafted from the
                  finest fabrics, this ensemble is a perfect blend of
                  traditional artistry and contemporary design.
                </p>
                <p>
                  The outfit includes a fully embroidered shirt, dupatta with
                  hand-finished borders, and matching trousers.
                </p>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="border-t border-gray-100 pt-8 space-y-4">
              {["Fabric & Care", "Shipping & Returns", "Size Guide"].map(
                (item) => (
                  <details key={item} className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-[11px] tracking-[0.2em] uppercase py-3 border-b border-gray-100">
                      {item}
                      <svg
                        className="w-4 h-4 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="pt-4 pb-2 text-[13px] text-medium-gray leading-relaxed">
                      <p>
                        Premium quality fabrics. Dry clean only. Please refer
                        to the care label for detailed instructions. Free
                        shipping on all domestic orders. International shipping
                        available.
                      </p>
                    </div>
                  </details>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
