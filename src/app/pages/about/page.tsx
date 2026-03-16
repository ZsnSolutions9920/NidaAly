import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1544957992-20514f595d6f?w=1920&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-white">
          <h1 className="text-3xl md:text-5xl tracking-[0.3em] uppercase font-light">
            Our Story
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-4">
            About Us
          </p>
          <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-8">
            A Celebration of Craft
          </h2>
          <div className="space-y-6 text-[14px] leading-relaxed text-medium-gray text-left">
            <p>
              NidaAly represents the pinnacle of South Asian luxury
              fashion, where centuries-old artisanal techniques meet
              contemporary design sensibilities. Founded with a vision to
              preserve and celebrate the rich textile heritage of the
              subcontinent, the brand has become synonymous with exquisite
              craftsmanship and timeless elegance.
            </p>
            <p>
              Each collection is a labor of love, involving hundreds of hours
              of meticulous hand-embroidery, weaving, and finishing. Our
              artisans, many of whom come from generations of craftspeople,
              bring their expertise and passion to every stitch, creating
              garments that are not merely clothing but wearable art.
            </p>
            <p>
              From bridal couture that makes dreams come alive to everyday
              pret that brings luxury into daily life, NidaAly offers a
              complete wardrobe for the modern woman who appreciates the
              beauty of handmade fashion.
            </p>
            <p>
              Our commitment to sustainability and ethical practices ensures
              that every piece is created with respect for both the artisan
              and the environment. We believe that true luxury lies not just
              in the beauty of the final product, but in the integrity of the
              process that creates it.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/collections/new-arrivals"
            className="inline-block border border-charcoal px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
