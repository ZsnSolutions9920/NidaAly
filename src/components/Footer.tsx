import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
          <h3 className="text-[12px] tracking-[0.3em] uppercase mb-2">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-[13px] text-white/60 mb-6 tracking-wide">
            Be the first to know about new collections and exclusive offers.
          </p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border border-white/30 px-4 py-3 text-[12px] tracking-wider outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-charcoal px-8 py-3 text-[11px] tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h4 className="text-[14px] tracking-[0.3em] uppercase mb-6">
              NidaAly
            </h4>
            <p className="text-[13px] text-white/60 leading-relaxed">
              A celebration of South Asian craftsmanship, bringing you timeless
              elegance through contemporary design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                "New Arrivals",
                "Bridals",
                "Luxury Formals",
                "Pret",
                "Menswear",
                "Accessories",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={`/collections/${item.toLowerCase().replace(/ /g, "-")}`}
                    className="text-[12px] text-white/60 hover:text-white transition-colors tracking-wider"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {[
                "Contact Us",
                "Shipping & Delivery",
                "Returns & Exchanges",
                "Size Guide",
                "Care Instructions",
                "FAQs",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/pages/contact"
                    className="text-[12px] text-white/60 hover:text-white transition-colors tracking-wider"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6">
              Get in Touch
            </h4>
            <div className="space-y-3 text-[12px] text-white/60 tracking-wider">
              <p>Karachi, Pakistan</p>
              <p>info@nidaaly.pk</p>
              <p>+92 21 1234 5678</p>
            </div>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {["Instagram", "Facebook", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label={social}
                >
                  {social === "Instagram" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {social === "Facebook" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social === "Pinterest" && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/40 tracking-wider">
            &copy; {new Date().getFullYear()} NidaAly. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-[11px] text-white/40 hover:text-white/60 tracking-wider transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
