"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
    subtitle: "New Collection",
    title: "Ethereal Luxe",
    description: "Discover the art of timeless elegance",
    cta: "Shop Now",
    link: "/collections/new-arrivals",
  },
  {
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&q=80",
    subtitle: "Bridal",
    title: "The Wedding Edit",
    description: "Handcrafted bridal couture for your special day",
    cta: "Explore",
    link: "/collections/bridals",
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
    subtitle: "Luxury Formals",
    title: "Festive Season",
    description: "Celebrate in exquisite style",
    cta: "View Collection",
    link: "/collections/luxury-formals",
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current, goToSlide]);

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center text-white px-6">
            <div
              className={`transition-all duration-1000 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <p className="text-[11px] tracking-[0.4em] uppercase mb-4">
                {slide.subtitle}
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] uppercase mb-4">
                {slide.title}
              </h2>
              <p className="text-[14px] tracking-wider mb-8 font-light opacity-90">
                {slide.description}
              </p>
              <Link
                href={slide.link}
                className="inline-block border border-white px-10 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-white hover:text-charcoal transition-all duration-300"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
