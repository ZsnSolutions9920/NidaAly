export default function ContactPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.4em] uppercase text-medium-gray mb-3">
          Get in Touch
        </p>
        <h1 className="text-3xl md:text-4xl tracking-[0.2em] uppercase font-light">
          Contact Us
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-[1000px] mx-auto">
        {/* Contact Form */}
        <div>
          <form className="space-y-6">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 px-4 py-3 text-[13px] tracking-wider outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 px-4 py-3 text-[13px] tracking-wider outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase mb-2">
                Phone
              </label>
              <input
                type="tel"
                className="w-full border border-gray-200 px-4 py-3 text-[13px] tracking-wider outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase mb-2">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full border border-gray-200 px-4 py-3 text-[13px] tracking-wider outline-none focus:border-charcoal transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-charcoal text-white py-4 text-[11px] tracking-[0.2em] uppercase hover:bg-charcoal/90 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-10">
          <div>
            <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">
              Visit Us
            </h3>
            <p className="text-[14px] text-medium-gray leading-relaxed">
              NidaAly Flagship Store
              <br />
              Karachi, Pakistan
            </p>
          </div>
          <div>
            <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">
              Email
            </h3>
            <p className="text-[14px] text-medium-gray">
              info@nidaaly.pk
            </p>
          </div>
          <div>
            <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">
              Phone
            </h3>
            <p className="text-[14px] text-medium-gray">+92 21 1234 5678</p>
          </div>
          <div>
            <h3 className="text-[11px] tracking-[0.2em] uppercase mb-4">
              Hours
            </h3>
            <p className="text-[14px] text-medium-gray leading-relaxed">
              Monday – Saturday: 11:00 AM – 8:00 PM
              <br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
