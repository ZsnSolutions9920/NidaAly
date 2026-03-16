import Link from "next/link";

export default function ImageBanner() {
  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=1920&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full flex items-center justify-center text-center text-white px-6">
        <div>
          <p className="text-[11px] tracking-[0.4em] uppercase mb-4 opacity-80">
            Limited Edition
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] uppercase mb-4">
            The Bridal Edit
          </h2>
          <p className="text-[14px] tracking-wider mb-8 font-light opacity-80 max-w-md mx-auto">
            Exquisite bridal couture crafted with centuries-old techniques and
            contemporary vision
          </p>
          <Link
            href="/collections/bridals"
            className="inline-block border border-white px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-white hover:text-charcoal transition-all duration-300"
          >
            Discover
          </Link>
        </div>
      </div>
    </section>
  );
}
