"use client";

import Navbar from "@/components/Navbar";
import { MapPin, Calendar, Clock, User } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getCourt, getImageUrl, type Court } from "@/library/api";

const biayaAdmin = 5000;

function formatTanggal(raw: string) {
  if (!raw) return "-";
  const d = new Date(`${raw}T00:00:00`);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hitungJamSelesai(waktuMulai: string, durasi: number) {
  if (!waktuMulai) return "-";
  const [h, m] = waktuMulai.split(":").map(Number);
  const total = h * 60 + m + durasi * 60;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function KonfirmasiContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);

  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    setLoading(true);
    getCourt(id)
      .then(setCourt)
      .catch(() => setCourt(null))
      .finally(() => setLoading(false));
  }, [id]);

  const nama = searchParams.get("nama") ?? "Ahmad Pratama";
  const nomorHP = searchParams.get("hp") ?? "";
  const tanggal = searchParams.get("tanggal") ?? "";
  const waktuMulai = searchParams.get("waktu") ?? "14:00";
  const durasi = Number(searchParams.get("durasi")) || 2;
  const kodePromo = searchParams.get("promo") ?? "";
  const diskonNominal = Number(searchParams.get("diskon")) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <p className="text-gray-400 animate-pulse">Memuat data lapangan...</p>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            Data lapangan tidak ditemukan
          </h1>
          <p className="text-gray-500">
            Coba buka halaman booking dari lapangan yang benar.
          </p>
        </div>
      </div>
    );
  }

  const subtotal = Number(court.price_per_hour) * durasi;
  const totalSebelumDiskon = subtotal + biayaAdmin;
  const total = Math.max(0, totalSebelumDiskon - diskonNominal);
  const jamSelesai = hitungJamSelesai(waktuMulai, durasi);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Konfirmasi Booking
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          pastikan detail booking anda sudah benar
        </p>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 space-y-5">
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-56 w-full overflow-hidden">
                <img
                  src={getImageUrl(court.image)}
                  alt={court.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <span className="inline-block bg-gray-900 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-3">
                  {court.sport_type}
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  {court.name}
                </h2>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <MapPin size={15} />
                  <span>{court.location}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">
                Detail Booking
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">Tanggal</p>
                    <p className="font-bold text-gray-900">
                      {formatTanggal(tanggal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">
                      Waktu & Durasi
                    </p>
                    <p className="font-bold text-gray-900 text-lg tracking-widest">
                      {waktuMulai} - {jamSelesai}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-5">
                Informasi Pemesanan
              </h3>
              <div className="flex items-start gap-3">
                <User size={20} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">{nama}</p>
                  {nomorHP && (
                    <p className="text-sm text-gray-500 mt-1">{nomorHP}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-base font-extrabold text-gray-900 mb-5">
                Ringkasan Harga
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Harga Per Jam</span>
                  <span>Rp {Number(court.price_per_hour).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Durasi</span>
                  <span>{durasi} Jam</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Biaya Admin</span>
                  <span>Rp {biayaAdmin.toLocaleString("id-ID")}</span>
                </div>

                {kodePromo && diskonNominal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon ({kodePromo})</span>
                    <span>- Rp {diskonNominal.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    Rp {total.toLocaleString("id-ID")}
                  </p>
                  {diskonNominal > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      Rp {totalSebelumDiskon.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>

              <button className="mt-5 w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 text-base">
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KonfirmasiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <KonfirmasiContent />
    </Suspense>
  );
}