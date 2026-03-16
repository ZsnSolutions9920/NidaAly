"use client";

import Link from "next/link";

const products = [
  {
    name: "Gulnar Bridal Lehenga",
    price: "₨ 485,000",
    image: "https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600&q=80",
    href: "/products/gulnar-bridal-lehenga",
  },
  {
    name: "Noor Luxury Formal",
    price: "₨ 125,000",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80",
    href: "/products/noor-luxury-formal",
  },
  {
    name: "Zara Embroidered Pret",
    price: "₨ 45,000",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
    href: "/products/zara-embroidered-pret",
  },
  {
    name: "Mehr Festive Collection",
    price: "₨ 89,000",
    image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&q=80",
    href: "/products/mehr-festive",
  },
];

export default function FeaturedProducts() {
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
            <Link key={product.name} href={product.href} className="group block">
              <div className="img-zoom aspect-[3/4] bg-white mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-[13px] tracking-wider text-center group-hover:opacity-70 transition-opacity">
                {product.name}
              </h3>
              <p className="text-[13px] tracking-wider text-center text-medium-gray mt-1">
                {product.price}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collections/all"
            className="inline-block border border-charcoal px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all duration-300"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
