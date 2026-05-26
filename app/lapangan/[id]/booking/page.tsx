"use client";

import Navbar from "@/components/Navbar";
import { User, CalendarDays, Clock, Timer, Phone, Tag, CheckCircle, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const venues = [
  {
    id: 1,
    name: "Jaya Padel",
    location: "Kuningan",
    sport: "Padel",
    pricePerHour: 85000,
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
  },
  {
    id: 2,
    name: "King Soka Futsal",
    location: "Tegal",
    sport: "Futsal",
    pricePerHour: 120000,
    imageUrl: "/foto/kingsokafutsal.png",
  },
  {
    id: 3,
    name: "EA Basketball",
    location: "Kemang",
    sport: "Basketball",
    pricePerHour: 100000,
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
  },
  {
    id: 4,
    name: "Badminton Berkoh",
    location: "Berkoh",
    sport: "Badminton",
    pricePerHour: 35000,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80",
  },
  {
    id: 5,
    name: "Basketball 98",
    location: "Jakarta Selatan",
    sport: "Basketball",
    pricePerHour: 350000,
    imageUrl: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80",
  },
  {
    id: 6,
    name: "Padel Kertajaya",
    location: "Yogyakarta",
    sport: "Padel",
    pricePerHour: 100000,
    imageUrl: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=600&q=80",
  },
   {
    id: 7,
    name: "GOR Futsal Maju",
    location: "Bandung",
    sport: "Futsal",
    pricePerHour: 90000,
    imageUrl: "/foto/Gor Futsal Maju.jpg",
  },
   {
    id: 8,
    name: "Smash Badminton",
    location: "Surabaya",
    sport: "Badminton",
    pricePerHour: 45000,
    imageUrl: "/foto/Smash badminton.png",
  },
   {
    id: 9,
    name: "Arena Padel Pro",
    location: "BSD",
    sport: "Padel",
    pricePerHour: 150000,
    imageUrl: "/foto/Arena Padel Pro.png",
  },
];

// Daftar kode promo — sinkron dengan halaman /promo
const PROMO_CODES: Record<string, { diskon: number; tipe: "persen" | "nominal"; minTransaksi: number; label: string; sport: string | null }> = {
  WELCOME20: { diskon: 20,    tipe: "persen",  minTransaksi: 100000, label: "Diskon 20% Member Baru",      sport: null       },
  FUTSAL30:  { diskon: 30,    tipe: "persen",  minTransaksi: 150000, label: "Diskon 30% Futsal Special",   sport: "Futsal"   },
  WEEKEND50: { diskon: 50000, tipe: "nominal", minTransaksi: 200000, label: "Diskon Rp 50.000 Weekend",    sport: null       },
};

export default function BookingFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const venue = venues.find((v) => v.id === id) ?? venues[1];

  const [nama, setNama] = useState("");
  const [nomorHP, setNomorHP] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [durasi, setDurasi] = useState("1");
  const [kodePromo, setKodePromo] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [promoInfo, setPromoInfo] = useState<typeof PROMO_CODES[string] | null>(null);
  const [promoError, setPromoError] = useState("");

  const durasiNum = Number(durasi) || 1;
  const subtotal = venue.pricePerHour * durasiNum;

  // Hitung diskon
  let diskonNominal = 0;
  if (promoStatus === "valid" && promoInfo) {
    if (promoInfo.tipe === "persen") {
      diskonNominal = Math.floor(subtotal * promoInfo.diskon / 100);
    } else {
      diskonNominal = promoInfo.diskon;
    }
  }
  const total = Math.max(0, subtotal - diskonNominal);

  const handleTerapkanPromo = () => {
    const kode = promoInput.trim().toUpperCase();
    const promo = PROMO_CODES[kode];
    if (!promo) {
      setPromoStatus("invalid");
      setPromoError("Kode promo tidak valid.");
      setPromoInfo(null);
      setKodePromo("");
      return;
    }
    // Cek apakah promo khusus untuk sport tertentu
    if (promo.sport && promo.sport !== venue.sport) {
      setPromoStatus("invalid");
      setPromoError(`Kode promo ini hanya berlaku untuk ${promo.sport}.`);
      setPromoInfo(null);
      setKodePromo("");
      return;
    }
    if (subtotal < promo.minTransaksi) {
      setPromoStatus("invalid");
      setPromoError(`Minimum transaksi Rp ${promo.minTransaksi.toLocaleString("id-ID")} tidak terpenuhi.`);
      setPromoInfo(null);
      setKodePromo("");
      return;
    }
    setPromoStatus("valid");
    setPromoError("");
    setPromoInfo(promo);
    setKodePromo(kode);
  };

  const handleHapusPromo = () => {
    setPromoStatus("idle");
    setPromoInfo(null);
    setPromoInput("");
    setKodePromo("");
    setPromoError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/lapangan/${venue.id}/konfirmasi?nama=${encodeURIComponent(nama)}&hp=${encodeURIComponent(nomorHP)}&tanggal=${encodeURIComponent(tanggal)}&waktu=${encodeURIComponent(waktuMulai)}&durasi=${durasiNum}&promo=${encodeURIComponent(kodePromo)}&diskon=${diskonNominal}`
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Booking Lapangan</h1>
        <p className="text-gray-700 font-semibold text-sm mb-8">
          Isi form di bawah untuk melakukan booking
        </p>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT — Form */}
          <div className="flex-1">
            <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nama Lengkap */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User size={16} className="text-gray-400" />
                    Nama Lengkap
                  </label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition" />
                </div>

                {/* Nomor Handphone */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone size={16} className="text-gray-400" />
                    Nomer Handphone
                  </label>
                  <input type="tel" value={nomorHP} onChange={(e) => setNomorHP(e.target.value)} placeholder="08xxxxxxxxxx" required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition" />
                </div>

                {/* Tanggal */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CalendarDays size={16} className="text-gray-400" />
                    Tanggal
                  </label>
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition" />
                </div>

                {/* Waktu Mulai */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Clock size={16} className="text-gray-400" />
                    Waktu Mulai
                  </label>
                  <input type="time" value={waktuMulai} onChange={(e) => setWaktuMulai(e.target.value)} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition" />
                </div>

                {/* Durasi */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Timer size={16} className="text-gray-400" />
                    Durasi (jam)
                  </label>
                  <input type="number" min="1" max="8" value={durasi} onChange={(e) => setDurasi(e.target.value)} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition" />
                </div>

                {/* Kode Promo */}
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Tag size={16} className="text-gray-400" />
                    Kode Promo <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>

                  {promoStatus === "valid" ? (
                    // Promo berhasil diterapkan
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <div>
                          <p className="text-sm font-bold text-green-700">{kodePromo}</p>
                          <p className="text-xs text-green-600">{promoInfo?.label} — hemat Rp {diskonNominal.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                      <button type="button" onClick={handleHapusPromo} className="text-gray-400 hover:text-red-500 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle"); }}
                        placeholder="Masukkan kode promo"
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-1 transition uppercase tracking-widest
                          ${promoStatus === "invalid" ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"}`}
                      />
                      <button
                        type="button"
                        onClick={handleTerapkanPromo}
                        className="px-5 py-3 bg-[#4a7c59] hover:bg-[#3a6347] text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}

                  {promoStatus === "invalid" && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                      <XCircle size={13} />
                      {promoError || "Kode promo tidak valid atau minimum transaksi tidak terpenuhi"}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button type="submit"
                  className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-4 rounded-xl transition-colors duration-200 text-base">
                  Konfirmasi Booking
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Ringkasan Booking */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-base">Ringkasan Booking</h3>
              </div>

              <div className="px-5 pt-4">
                <div className="rounded-xl overflow-hidden h-36 w-full">
                  <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="p-5 space-y-0">
                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Lapangan</p>
                  <p className="font-bold text-gray-900 text-sm">{venue.name}</p>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Jenis</p>
                  <p className="font-bold text-gray-900 text-sm">{venue.sport}</p>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Durasi</p>
                  <p className="font-bold text-gray-900 text-sm">{durasiNum} Jam</p>
                </div>

                {/* Diskon row — hanya muncul kalau promo valid */}
                {promoStatus === "valid" && (
                  <div className="border-b border-gray-100 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Diskon ({kodePromo})</p>
                    <p className="font-bold text-green-600 text-sm">- Rp {diskonNominal.toLocaleString("id-ID")}</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-blue-50 px-5 py-4 rounded-b-2xl">
                <p className="text-xs text-blue-400 font-semibold mb-1">Total Biaya</p>
                <p className="text-2xl font-extrabold text-blue-600">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                {promoStatus === "valid" && (
                  <p className="text-xs text-gray-400 line-through mt-0.5">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
