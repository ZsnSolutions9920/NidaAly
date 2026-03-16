import Link from "next/link";

export default function BrandStory() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Image */}
        <div className="img-zoom aspect-[4/5] bg-light-gray">
          <img
            src="https://images.unsplash.com/photo-1544957992-20514f595d6f?w=800&q=80"
            alt="Brand Story"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="lg:pl-8">
          <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-3">
            Our Story
          </p>
          <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-6">
            A Legacy of Craft
          </h2>
          <div className="space-y-4 text-[14px] leading-relaxed text-medium-gray">
            <p>
              NidaAly is a celebration of South Asian heritage, where
              centuries-old artisanal techniques meet contemporary design
              sensibilities. Each piece is a testament to the enduring beauty of
              handcrafted luxury.
            </p>
            <p>
              From delicate hand-embroidery to intricate textile weaving, our
              collections honor the artisans whose skill and dedication bring
              every garment to life. We believe in fashion that tells a story —
              of culture, of craftsmanship, and of conscious creation.
            </p>
            <p>
              Our commitment extends beyond aesthetics. We work closely with
              local communities, ensuring fair practices and preserving
              traditional techniques for future generations.
            </p>
          </div>
          <Link
            href="/pages/about"
            className="inline-block mt-8 border border-charcoal px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-white transition-all duration-300"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}
