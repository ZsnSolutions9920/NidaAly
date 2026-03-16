const images = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
  "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
];

export default function InstagramFeed() {
  return (
    <section className="py-20">
      <div className="text-center mb-12 px-6">
        <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-3">
          @nidaaly
        </p>
        <h2 className="text-2xl md:text-3xl tracking-[0.2em] uppercase font-light">
          Follow Us on Instagram
        </h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
        {images.map((img, index) => (
          <a
            key={index}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="img-zoom aspect-square bg-light-gray block"
          >
            <img
              src={img}
              alt={`Instagram post ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
