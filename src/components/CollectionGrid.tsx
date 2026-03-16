import Link from "next/link";

const collections = [
  {
    name: "New Arrivals",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    href: "/collections/new-arrivals",
  },
  {
    name: "Bridals",
    image: "https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=800&q=80",
    href: "/collections/bridals",
  },
  {
    name: "Luxury Formals",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80",
    href: "/collections/luxury-formals",
  },
  {
    name: "Pret",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80",
    href: "/collections/pret",
  },
];

export default function CollectionGrid() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-3">
          Explore
        </p>
        <h2 className="text-2xl md:text-3xl tracking-[0.2em] uppercase font-light">
          Our Collections
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {collections.map((col) => (
          <Link key={col.name} href={col.href} className="group block">
            <div className="img-zoom aspect-[3/4] relative bg-light-gray">
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500" />
              <div className="absolute inset-0 flex items-end justify-center pb-8">
                <h3 className="text-white text-[13px] tracking-[0.2em] uppercase font-medium">
                  {col.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
