import Link from "next/link";

export function CTABanner() {
  return (
    <section className="bg-[#4a7c59] py-16 text-white text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          Siap Untuk Main?
        </h2>
        <p className="text-green-100 text-base mb-8 leading-relaxed">
          Booking lapangan favoritmu sekarang dan
          <br />
          nikmati pengalaman bermain terbaik
        </p>
        <Link
          href="/lapangan"
          className="inline-block bg-[#2d4a35] hover:bg-[#243c2b] text-white font-bold px-10 py-3.5 rounded-xl transition-colors duration-200 text-base"
        >
          Mulai Booking
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#2d4a35] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-extrabold text-xl mb-3 tracking-tight">BOOKAJA</h3>
            <p className="text-green-200 text-sm leading-relaxed">
              Platform booking lapangan futsal dan badminton terpercaya di Indonesia
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base mb-4">Quick link</h4>
            <ul className="space-y-2">
              {["About us", "Terms", "Privacy"].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase().replace(" ", "-")}`}
                    className="text-green-200 hover:text-white text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-base mb-4">Kontak</h4>
            <div className="space-y-2">
              <p className="text-green-200 text-sm">
                Email: info@bookinglapangan.com
              </p>
              <p className="text-green-200 text-sm">Phone: +62 812 3456 7890</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
