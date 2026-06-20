"use client";

import Navbar from "@/components/Navbar";
import {
  User,
  CalendarDays,
  Clock,
  Timer,
  Phone,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  getCourt,
  getPromotions,
  getImageUrl,
  type Court,
  type Promotion,
} from "@/library/api";

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(params.id);

  const [court, setCourt] = useState<Court | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [nama, setNama] = useState("");
  const [nomorHP, setNomorHP] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [durasi, setDurasi] = useState("1");
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [promoError, setPromoError] = useState("");
  const [promoTerpilih, setPromoTerpilih] = useState<Promotion | null>(null);

  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    // Prefill from URL if exists
    const qTanggal = searchParams.get("tanggal");
    const qWaktu = searchParams.get("waktu");
    if (qTanggal) setTanggal(qTanggal);
    if (qWaktu) setWaktuMulai(qWaktu);

    getCourt(id).then(setCourt).catch(() => {});
    getPromotions().then(setPromotions).catch(() => {});
  }, [id, searchParams]);

  useEffect(() => {
    if (!tanggal) {
      setAvailability([]);
      return;
    }
    
    setLoadingSlots(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/courts/${id}/availability?date=${tanggal}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.slots) {
          setAvailability(data.slots);
          // Auto select first available if currently selected is invalid or empty
          const stillValid = data.slots.find((s: TimeSlot) => s.time === waktuMulai && s.available);
          if (!stillValid) {
            const firstAvail = data.slots.find((s: TimeSlot) => s.available);
            setWaktuMulai(firstAvail ? firstAvail.time : "");
          }
        } else {
          setAvailability([]);
          setWaktuMulai("");
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [tanggal, id]);

  const durasiNum = Number(durasi) || 1;
  const subtotal = court ? Number(court.price_per_hour) * durasiNum : 0;

  let diskonNominal = 0;
  if (promoStatus === "valid" && promoTerpilih) {
    diskonNominal = Math.floor(
      (subtotal * Number(promoTerpilih.discount_percent)) / 100
    );
  }
  const total = Math.max(0, subtotal - diskonNominal);

  const handleTerapkanPromo = () => {
    if (!court) {
      setPromoStatus("invalid");
      setPromoError("Data lapangan belum siap.");
      setPromoTerpilih(null);
      return;
    }

    const kode = promoInput.trim().toUpperCase();
    const promo = promotions.find(
      (p) => p.code?.toUpperCase() === kode && p.is_active
    );

    if (!promo) {
      setPromoStatus("invalid");
      setPromoError("Kode promo tidak valid.");
      setPromoTerpilih(null);
      return;
    }

    // Promo untuk lapangan tertentu
    if (promo.court_id !== null && Number(promo.court_id) !== id) {
      setPromoStatus("invalid");
      setPromoError("Kode promo ini tidak berlaku untuk lapangan ini.");
      setPromoTerpilih(null);
      return;
    }

    // Promo untuk jenis olahraga tertentu
    if (
      promo.sport_type &&
      promo.sport_type.toLowerCase() !== court.sport_type?.toLowerCase()
    ) {
      setPromoStatus("invalid");
      setPromoError(`Promo hanya berlaku untuk olahraga ${promo.sport_type}.`);
      setPromoTerpilih(null);
      return;
    }

    if (!tanggal) {
      setPromoStatus("invalid");
      setPromoError("Pilih tanggal booking terlebih dahulu.");
      setPromoTerpilih(null);
      return;
    }

    const bookingDate = new Date(`${tanggal}T00:00:00`);
    const validFrom = new Date(`${String(promo.valid_from).slice(0, 10)}T00:00:00`);
    const validUntil = new Date(
      `${String(promo.valid_until).slice(0, 10)}T23:59:59`
    );

    if (bookingDate < validFrom || bookingDate > validUntil) {
      setPromoStatus("invalid");
      setPromoError("Promo tidak berlaku pada tanggal booking yang dipilih.");
      setPromoTerpilih(null);
      return;
    }

    setPromoStatus("valid");
    setPromoError("");
    setPromoTerpilih(promo);
  };

  const handleHapusPromo = () => {
    setPromoStatus("idle");
    setPromoError("");
    setPromoInput("");
    setPromoTerpilih(null);
  };

  const isDurationValid = useMemo(() => {
    if (!waktuMulai || availability.length === 0) return false;
    const startIndex = availability.findIndex(s => s.time === waktuMulai);
    if (startIndex === -1) return false;
    
    // Check if subsequent slots are available
    for (let i = 0; i < durasiNum; i++) {
      const slot = availability[startIndex + i];
      if (!slot || !slot.available) {
        return false;
      }
    }
    return true;
  }, [waktuMulai, durasiNum, availability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDurationValid) {
      alert("Durasi yang dipilih melebihi waktu yang tersedia. Ada slot jam yang sudah di-booking orang lain.");
      return;
    }

    router.push(
      `/lapangan/${id}/konfirmasi?nama=${encodeURIComponent(
        nama
      )}&hp=${encodeURIComponent(nomorHP)}&tanggal=${encodeURIComponent(
        tanggal
      )}&waktu=${encodeURIComponent(waktuMulai)}&durasi=${durasiNum}&promo=${encodeURIComponent(
        promoTerpilih?.code ?? ""
      )}&diskon=${diskonNominal}`
    );
  };

  if (!court)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Navbar />
        <p className="text-gray-400 animate-pulse">Memuat data lapangan...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Booking Lapangan
        </h1>
        <p className="text-gray-700 font-semibold text-sm mb-8">
          Isi form di bawah untuk melakukan booking
        </p>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User size={16} className="text-gray-400" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone size={16} className="text-gray-400" />
                    Nomer Handphone
                  </label>
                  <input
                    type="tel"
                    value={nomorHP}
                    onChange={(e) => setNomorHP(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CalendarDays size={16} className="text-gray-400" />
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Clock size={16} className="text-gray-400" />
                    Waktu Mulai
                  </label>
                  <select
                    value={waktuMulai}
                    onChange={(e) => setWaktuMulai(e.target.value)}
                    required
                    disabled={loadingSlots || !tanggal}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Pilih Jam</option>
                    {availability.map((slot) => (
                      <option 
                        key={slot.time} 
                        value={slot.time} 
                        disabled={!slot.available}
                      >
                        {slot.time} {slot.available ? "" : "(Sudah Dibooking)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Timer size={16} className="text-gray-400" />
                    Durasi (jam)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition mb-2"
                  />
                  {!isDurationValid && waktuMulai && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle size={13} />
                      Durasi bentrok dengan jadwal yang sudah dibooking.
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Tag size={16} className="text-gray-400" />
                    Kode Promo{" "}
                    <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>

                  {promoStatus === "valid" && promoTerpilih ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <div>
                          <p className="text-sm font-bold text-green-700">
                            {promoTerpilih.code}
                          </p>
                          <p className="text-xs text-green-600">
                            {promoTerpilih.title} — hemat Rp{" "}
                            {diskonNominal.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={handleHapusPromo}>
                        <XCircle
                          size={18}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoStatus("idle");
                        }}
                        placeholder="Masukkan kode promo"
                        className={`flex-1 border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-1 transition uppercase tracking-widest ${
                          promoStatus === "invalid"
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-gray-300 focus:border-[#4a7c59] focus:ring-[#4a7c59]"
                        }`}
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
                      <XCircle size={13} /> {promoError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isDurationValid || !tanggal || !waktuMulai}
                  className="w-full bg-[#4a7c59] hover:bg-[#3a6347] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors duration-200 text-base"
                >
                  Konfirmasi Booking
                </button>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-base">
                  Ringkasan Booking
                </h3>
              </div>

              <div className="px-5 pt-4">
                <div className="rounded-xl overflow-hidden h-36 w-full">
                  <img
                    src={getImageUrl(court.image)}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="p-5">
                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Lapangan</p>
                  <p className="font-bold text-gray-900 text-sm">{court.name}</p>
                </div>

                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Jenis</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {court.sport_type}
                  </p>
                </div>

                <div className="border-b border-gray-100 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Durasi</p>
                  <p className="font-bold text-gray-900 text-sm">
                    {durasiNum} Jam
                  </p>
                </div>

                {promoStatus === "valid" && promoTerpilih && (
                  <div className="border-b border-gray-100 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">
                      Diskon ({promoTerpilih.code})
                    </p>
                    <p className="font-bold text-green-600 text-sm">
                      - Rp {diskonNominal.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 px-5 py-4 rounded-b-2xl">
                <p className="text-xs text-blue-400 font-semibold mb-1">
                  Total Biaya
                </p>
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