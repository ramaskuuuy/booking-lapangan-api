"use client";

import Navbar from "@/components/Navbar";
import { MapPin, Star, Clock, Users, Check, Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getCourt, getImageUrl, parseFacilities, type Court } from "@/library/api";

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className={i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"} />
      ))}
    </div>
  );
}

const sportIconMap: Record<string, string> = {
  Padel: "🏓", Futsal: "⚽", Basketball: "🏀", Badminton: "🏸", Tenis: "🎾",
};

const mockReviews = [
  { nama: "Ahmad Pratama", rating: 5, komentar: "Lapangan sangat bagus dan bersih. Pelayanan ramah!" },
  { nama: "Rama Pratama", rating: 5, komentar: "Harganya terjangkau, recommended!" },
];

const kapasitasMap: Record<string, string> = {
  Futsal: "10 - 12 Orang", Basketball: "10 - 15 Orang",
  Badminton: "2 - 4 Orang", Padel: "4 - 6 Orang", Tenis: "2 - 4 Orang",
};

export default function VenueDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    getCourt(id)
      .then(setCourt)
      .catch(() => setError("Lapangan tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 animate-pulse">
        <div className="w-full h-[400px] bg-gray-200 rounded-2xl mb-8" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-40 bg-gray-200 rounded-2xl" />
          </div>
          <div className="w-72 h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error || !court) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <p className="text-red-500">{error || "Lapangan tidak ditemukan"}</p>
        <Link href="/lapangan" className="mt-4 text-[#4a7c59] hover:underline block">← Kembali</Link>
      </div>
    </div>
  );

  const facilities = parseFacilities(court.facilities);
  const col1 = facilities.slice(0, Math.ceil(facilities.length / 2));
  const col2 = facilities.slice(Math.ceil(facilities.length / 2));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img src={getImageUrl(court.image)} alt={court.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <span className="inline-block bg-white text-gray-900 text-sm font-bold px-4 py-1.5 rounded-full mb-3">
            {court.sport_type}
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-2">{court.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[#6fcf97]">
              <MapPin size={15} />
              <span className="text-sm font-semibold">{court.location || court.type}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">
                {Number(court.rating) > 0
                  ? `${Number(court.rating).toFixed(1)} (${court.review_count} Reviews)`
                  : "Belum ada rating"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT */}
          <div className="flex-1 space-y-5">

            {/* Tentang Lapangan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-3">Tentang Lapangan</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {court.description || `${court.name} adalah lapangan ${court.sport_type} berkualitas tinggi dengan fasilitas lengkap. Tersedia untuk sewa per jam dengan konfirmasi instan.`}
              </p>
            </div>

            {/* Fasilitas */}
            {facilities.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4">Fasilitas</h2>
                <div className="grid grid-cols-2 gap-y-3">
                  {facilities.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-gray-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waktu Tersedia */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">Waktu Tersedia</h2>
              <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar size={16} />
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">Reviews</h2>
              <div className="space-y-5">
                {mockReviews.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-500 font-bold text-sm">
                        {r.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{r.nama}</p>
                        <StarRow count={r.rating} />
                        <p className="text-sm text-gray-600 mt-1">{r.komentar}</p>
                      </div>
                    </div>
                    {i < mockReviews.length - 1 && <div className="border-b border-gray-100 mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Booking card */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <p className="text-xs text-gray-400 mb-1">Harga Per sesi</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-5">
                Rp {Number(court.price_per_hour).toLocaleString("id-ID")}
              </p>

              <Link
                href={`/lapangan/${court.id}/booking`}
                className="block w-full text-center bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 text-base"
              >
                Booking Sekarang
              </Link>

              <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400 shrink-0" />
                  <span>Kapasitas : {kapasitasMap[court.sport_type] ?? "2 - 10 Orang"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span>Buka : 06:00 - 23:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-gray-400 shrink-0" />
                  <span>Konfirmasi Instan</span>
                </div>
              </div>

              <div className="mt-4 bg-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                Gratis pembatalan hingga 24 jam sebelum waktu booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
