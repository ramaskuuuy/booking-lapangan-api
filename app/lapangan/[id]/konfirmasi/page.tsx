"use client";

import Navbar from "@/components/Navbar";
import { MapPin, Calendar, Clock, User } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getCourt, getImageUrl, type Court } from "@/library/api";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", ...(opts?.headers ?? {}) } });

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

  const router = useRouter();
  const [step, setStep] = useState<"summary" | "payment" | "success">("summary");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Payment Proof state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleBooking = async () => {
    if (!getToken()) {
      alert("Silakan login terlebih dahulu untuk melakukan booking.");
      router.push("/masuk");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await authFetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          court_id: court.id,
          date: tanggal,
          start_time: waktuMulai,
          end_time: jamSelesai,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat booking");

      setPaymentId(data.booking.payment.id);
      setStep("payment");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !paymentId) return;

    setSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("proof_image", proofFile);
    formData.append("transferred_amount", String(total));

    try {
      const res = await authFetch(`${API_BASE}/payments/${paymentId}/upload-proof`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal upload bukti pembayaran");

      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan upload");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Booking Berhasil!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Bukti pembayaran Anda sedang diverifikasi oleh pemilik lapangan. Anda dapat mengecek status booking di menu My Bookings.
          </p>
          <button
            onClick={() => router.push("/my-bookings")}
            className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Lihat My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
          <div className="bg-white border border-gray-200 shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-[#4a7c59] p-6 text-center text-white">
              <h2 className="text-2xl font-extrabold mb-1">Pembayaran QRIS</h2>
              <p className="text-green-50 opacity-90 text-sm">Scan QR code di bawah ini menggunakan aplikasi e-wallet atau m-banking Anda</p>
            </div>
            
            <div className="p-8">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-center mb-8">
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <img src="/qris.png" alt="QRIS Code" className="w-64 h-64 object-contain mx-auto mix-blend-multiply" 
                       onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"; }} />
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 mb-1">Total Tagihan</p>
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">Rp {total.toLocaleString("id-ID")}</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wide">Upload Bukti Pembayaran</h3>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProofFile(file);
                      setProofPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                
                {proofPreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                    <img src={proofPreview} alt="Preview Bukti" className="w-full max-h-48 object-cover" />
                  </div>
                )}
              </div>

              <button 
                onClick={handleUploadProof}
                disabled={submitting || !proofFile}
                className="w-full bg-[#4a7c59] hover:bg-[#3a6347] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg text-lg flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <>Memproses...</>
                ) : (
                  <>Konfirmasi Pembayaran</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Konfirmasi Booking
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          pastikan detail booking anda sudah benar
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

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

              <button 
                onClick={handleBooking}
                disabled={submitting}
                className="mt-5 w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 text-base disabled:opacity-60"
              >
                {submitting ? "Memproses..." : "Lanjut ke Pembayaran"}
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