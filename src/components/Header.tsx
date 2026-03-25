"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/use-cart";
import { useLocale } from "@/hooks/use-locale";
import CartDrawer from "./CartDrawer";
import logoBlack from "../../public/logoblack.webp";

const navLinks = [
  { name: "New Arrivals", href: "/collections/new-arrivals" },
  { name: "Bridals", href: "/collections/bridals" },
  { name: "Luxury Formals", href: "/collections/luxury-formals" },
  { name: "Pret", href: "/collections/pret" },
  { name: "Menswear", href: "/collections/menswear" },
  { name: "Accessories", href: "/collections/accessories" },
];

interface SearchResult {
  products: { id: string; title: string; slug: string; pricePKR: number; priceAED: number | null; priceUSD: number | null; images: { url: string }[] }[];
  collections: { id: string; title: string; slug: string }[];
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>(undefined);

  const { data: session } = useSession();
  const { itemCount } = useCart();
  const { formatPrice } = useLocale();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults(null);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-charcoal text-white text-center py-2 text-[11px] tracking-[0.2em] uppercase">
        Complimentary Shipping on All Domestic Orders
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* Top bar with logo */}
        <div className="border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: Hamburger (mobile) + Search */}
            <div className="flex items-center gap-4 w-1/3">
              <button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="w-1/3 text-center">
              <Link href="/">
                <Image
                  src={logoBlack}
                  alt="NidaAly"
                  width={150}
                  className="mx-auto sm:h-14 h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right: Wishlist + Account + Cart */}
            <div className="flex items-center justify-end gap-4 w-1/3">
              {/* Wishlist */}
              <Link href={session ? "/account/wishlist" : "/auth/login?callbackUrl=/account/wishlist"} aria-label="Wishlist">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Account */}
              <Link href={session ? "/account" : "/auth/login"} aria-label="Account">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6">
            <ul className="flex items-center justify-center gap-8 py-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[12px] tracking-[0.18em] uppercase hover:opacity-60 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Search Bar with Live Results */}
        {searchOpen && (
          <div ref={searchRef} className="border-b border-gray-100 animate-fade-in">
            <div className="max-w-[600px] mx-auto px-6 py-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-b border-charcoal py-2 pr-10 text-sm tracking-wider outline-none bg-transparent"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults && (searchResults.products.length > 0 || searchResults.collections.length > 0) && (
                <div className="absolute left-0 right-0 bg-white border border-gray-100 shadow-lg mx-6 mt-2 max-h-80 overflow-y-auto z-50">
                  {searchResults.collections.length > 0 && (
                    <div className="p-4 border-b border-gray-50">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-medium-gray mb-2">Collections</p>
                      {searchResults.collections.map((col) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.slug}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults(null); }}
                          className="block py-1.5 text-sm hover:text-gold transition-colors"
                        >
                          {col.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.products.length > 0 && (
                    <div className="p-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-medium-gray mb-2">Products</p>
                      {searchResults.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults(null); }}
                          className="flex items-center gap-3 py-2 hover:bg-light-gray transition-colors -mx-2 px-2"
                        >
                          {product.images[0] && (
                            <img src={product.images[0].url} alt="" className="w-10 h-12 object-cover bg-light-gray" />
                          )}
                          <div>
                            <p className="text-sm">{product.title}</p>
                            <p className="text-xs text-medium-gray">{formatPrice(product.pricePKR)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {searchResults && searchResults.products.length === 0 && searchResults.collections.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute left-0 right-0 bg-white border border-gray-100 shadow-lg mx-6 mt-2 p-6 text-center z-50">
                  <p className="text-sm text-medium-gray">No results found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-gray-100 animate-fade-in">
            <ul className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[12px] tracking-[0.18em] uppercase block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
