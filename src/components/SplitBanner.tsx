import Link from "next/link";

export default function SplitBanner() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left */}
      <Link href="/collections/pret" className="group relative block">
        <div className="img-zoom aspect-[4/5] md:aspect-auto md:h-[70vh]">
          <img
            src="https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=900&q=80"
            alt="Pret Collection"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase mb-2 opacity-80">
              Ready to Wear
            </p>
            <h3 className="text-2xl md:text-4xl tracking-[0.15em] uppercase font-light mb-4">
              Pret
            </h3>
            <span className="inline-block border border-white px-8 py-2.5 text-[11px] tracking-[0.2em] uppercase group-hover:bg-white group-hover:text-charcoal transition-all duration-300">
              Shop Now
            </span>
          </div>
        </div>
      </Link>

      {/* Right */}
      <Link href="/collections/luxury-formals" className="group relative block">
        <div className="img-zoom aspect-[4/5] md:aspect-auto md:h-[70vh]">
          <img
            src="https://images.unsplash.com/photo-1495385794356-15371f348c31?w=900&q=80"
            alt="Luxury Formals"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase mb-2 opacity-80">
              Occasion Wear
            </p>
            <h3 className="text-2xl md:text-4xl tracking-[0.15em] uppercase font-light mb-4">
              Luxury Formals
            </h3>
            <span className="inline-block border border-white px-8 py-2.5 text-[11px] tracking-[0.2em] uppercase group-hover:bg-white group-hover:text-charcoal transition-all duration-300">
              Shop Now
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
