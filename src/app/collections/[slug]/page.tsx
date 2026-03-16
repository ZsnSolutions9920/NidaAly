import Link from "next/link";

const allProducts = [
  {
    name: "Gulnar Bridal Lehenga",
    price: "₨ 485,000",
    image: "https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=600&q=80",
    slug: "gulnar-bridal-lehenga",
  },
  {
    name: "Noor Luxury Formal",
    price: "₨ 125,000",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80",
    slug: "noor-luxury-formal",
  },
  {
    name: "Zara Embroidered Pret",
    price: "₨ 45,000",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
    slug: "zara-embroidered-pret",
  },
  {
    name: "Mehr Festive Collection",
    price: "₨ 89,000",
    image: "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=600&q=80",
    slug: "mehr-festive",
  },
  {
    name: "Rani Silk Dupatta Set",
    price: "₨ 68,000",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80",
    slug: "rani-silk-dupatta",
  },
  {
    name: "Anaya Bridal Gharara",
    price: "₨ 395,000",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
    slug: "anaya-bridal-gharara",
  },
  {
    name: "Sitara Evening Gown",
    price: "₨ 175,000",
    image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&q=80",
    slug: "sitara-evening-gown",
  },
  {
    name: "Chand Pret Kurta",
    price: "₨ 32,000",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    slug: "chand-pret-kurta",
  },
];

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 text-[12px] tracking-wider text-medium-gray">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{title}</span>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-light">
          {title}
        </h1>
        <p className="text-[13px] text-medium-gray tracking-wider mt-3">
          {allProducts.length} Products
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button className="text-[11px] tracking-[0.2em] uppercase flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
        <select className="text-[11px] tracking-[0.2em] uppercase bg-transparent outline-none cursor-pointer">
          <option>Sort By</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group block"
          >
            <div className="img-zoom aspect-[3/4] bg-light-gray mb-4">
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
    </div>
  );
}
