"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/foto/logo.png" alt="logo" width={130} height={130} />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-[#4a7c59] font-medium transition-colors">
              Home
            </Link>
            <Link href="/lapangan" className="text-gray-700 hover:text-[#4a7c59] font-medium transition-colors">
              Lapangan
            </Link>
            <Link href="/promo" className="text-gray-700 hover:text-[#4a7c59] font-medium transition-colors">
              Promo
            </Link>
            <Link href="/my-bookings" className="text-gray-700 hover:text-[#4a7c59] font-medium transition-colors">
              My Bookings
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Icon Notifikasi */}
            <button className="p-2 text-gray-500 hover:text-[#4a7c59] transition-colors" aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {isLoggedIn ? (
              /* Sudah login → tampil tombol Profile */
              <Link
                href="/profile"
                className="flex items-center gap-2 px-5 py-2 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User size={16} className="text-gray-500" />
                Profile
              </Link>
            ) : (
              /* Belum login → tampil Masuk & Daftar */
              <>
                <Link
                  href="/masuk"
                  className="px-5 py-2 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="px-5 py-2 bg-[#41674A] text-white font-semibold rounded-lg hover:bg-[#3a6347] transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}