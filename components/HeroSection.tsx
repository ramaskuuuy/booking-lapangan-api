import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[520px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
        backgroundImage: "url('/foto/fotoHeroSection.png')",
     }}
/>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-lg">
          Booking Lapangan Online
        </h1>
        <p className="text-lg md:text-xl font-medium mb-8 text-gray-200">
          Pesan Lapangan Olahraga Dengan&nbsp; Mudah
        </p>
        <Link
          href="/lapangan"
          className="inline-block bg-[#41674A] hover:bg-[#3a6347] text-white font-bold text-lg px-10 py-3.5 rounded-xl transition-colors duration-200 shadow-lg"
        >
          Booking Sekarang
        </Link>
      </div>
    </section>
  );
}
