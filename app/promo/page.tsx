"use client";

import Navbar from "@/components/Navbar";
import { Tag, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getPromotions, getImageUrl, formatTanggalDB, type Promotion } from "@/library/api";

export default function PromoPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPromotions()
      .then(setPromos)
      .catch(() => setError("Gagal memuat data promo."))
      .finally(() => setLoading(false));
  }, []);

  const promoUtama = promos[0] ?? null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Promo & Penawaran</h1>
        <p className="text-gray-500 mb-8">Dapatkan diskon spesial untuk booking Anda</p>

        {loading ? (
          <div className="space-y-6">
            <div className="bg-gray-200 rounded-2xl h-40 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : promos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Belum ada promo tersedia</p>
          </div>
        ) : (
          <>
            {/* Banner Promo Utama */}
            {promoUtama && (
              <div
                className="rounded-2xl p-8 mb-10"
                style={{
                  background: promoUtama.banner_image
                    ? `linear-gradient(rgba(44,78,50,0.85), rgba(44,78,50,0.85)), url(${getImageUrl(promoUtama.banner_image)}) center/cover`
                    : "#4a7c59",
                }}
              >
                <p className="text-green-200 text-xs font-bold tracking-widest uppercase mb-2">
                  PROMO TERBARU
                </p>
                <h2 className="text-white text-2xl font-extrabold mb-2">{promoUtama.title}</h2>
                <p className="text-green-100 text-sm mb-1">
                  {promoUtama.description || `Dapatkan diskon ${promoUtama.discount_percent}% untuk booking Anda`}
                </p>
                <p className="text-green-200 text-xs mb-6">
                  Berlaku: {formatTanggalDB(promoUtama.valid_from)} — {formatTanggalDB(promoUtama.valid_until)}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-lg border border-white/30 tracking-widest">
                    {promoUtama.code}
                  </span>
                  <Link
                    href="/lapangan"
                    className="bg-white text-[#4a7c59] font-bold text-sm px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Gunakan Sekarang
                  </Link>
                </div>
              </div>
            )}

            {/* Promo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="h-44 w-full overflow-hidden bg-gray-100">
                    <img
                      src={promo.banner_image
                        ? getImageUrl(promo.banner_image)
                        : "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80"}
                      alt={promo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                      Diskon {Number(promo.discount_percent)}%
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{promo.title}</h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {promo.description || `Hemat ${promo.discount_percent}% untuk booking Anda`}
                    </p>

                    {/* Kode Promo — langsung dari database */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Tag size={13} className="text-gray-400" />
                        <span>Kode Promo :</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800 tracking-widest">
                        {promo.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <Calendar size={13} className="text-gray-400" />
                      <span>
                        {formatTanggalDB(promo.valid_from)} — {formatTanggalDB(promo.valid_until)}
                      </span>
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${promo.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {promo.is_active ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
