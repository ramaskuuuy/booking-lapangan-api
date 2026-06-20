"use client";

import Navbar from "@/components/Navbar";
import { Calendar, Clock, Star, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/library/api";
import { authFetch as baseAuthFetch } from "@/library/api"; // I'll assume this exists, wait I'll define it locally since it doesn't exist here

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", ...(opts?.headers ?? {}) } });

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-600 border border-green-200",
  completed: "bg-blue-100 text-blue-600 border border-blue-200",
  pending:   "bg-yellow-100 text-yellow-600 border border-yellow-200",
  cancelled: "bg-red-100 text-red-500 border border-red-200",
};

function formatTanggal(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewModal, setReviewModal] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchBookings = () => {
    setLoading(true);
    const token = getToken();
    if (!token) { setError("Silakan login terlebih dahulu."); setLoading(false); return; }

    fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(r => r.json())
      .then(data => setBookings(data.data ?? []))
      .catch(() => setError("Gagal memuat riwayat booking."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const submitReview = async () => {
    if (!reviewModal) return;
    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await authFetch(`${API_BASE}/bookings/${reviewModal.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengirim ulasan.");
      }

      setReviewModal(null);
      setRating(5);
      setComment("");
      fetchBookings();
    } catch (err: any) {
      setReviewError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  const stats = [
    { label: "Total Booking", value: total },
    { label: "Pending",       value: pending },
    { label: "Confirmed",     value: confirmed },
    { label: "Completed",     value: completed },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Booking History</h1>
        <p className="text-gray-400 text-sm mb-8">Lihat Semua booking anda</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-2">{s.label}</p>
              <p className="text-3xl font-extrabold text-[#4a7c59]">{loading ? "..." : s.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-400">
            <p>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-lg">Belum ada booking</p>
            <p className="text-sm mt-1">Booking lapangan pertama Anda sekarang!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking, i) => (
              <div key={booking.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="h-52 w-full overflow-hidden">
                  <img
                    src={getImageUrl(booking.court?.image ?? null)}
                    alt={booking.court?.name ?? "Lapangan"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Status + ID */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ID : BK{String(i + 1).padStart(3, "0")}
                    </span>
                  </div>

                  {/* Nama Lapangan */}
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3">
                    {booking.court?.name ?? "-"}
                  </h3>

                  {/* Tanggal & Waktu */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Tanggal</p>
                        <p className="text-sm font-semibold text-gray-800">{formatTanggal(booking.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Waktu</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {booking.start_time} - {booking.end_time} WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Total Biaya</p>
                      <p className="text-xl font-extrabold text-[#4a7c59]">
                        Rp {Number(booking.total_price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    
                    {booking.status === "completed" && !booking.review && (
                      <button
                        onClick={() => {
                          setReviewModal(booking);
                          setRating(5);
                          setComment("");
                          setReviewError("");
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Star size={16} fill="currentColor" />
                        Beri Ulasan
                      </button>
                    )}
                    {booking.review && (
                      <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-bold">{booking.review.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Beri Ulasan Lapangan</h2>
            <p className="text-sm text-gray-500 mb-6">Bagaimana pengalaman bermain Anda di {reviewModal.court?.name}?</p>

            {reviewError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {reviewError}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Komentar (Opsional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Ceritakan pengalaman Anda di sini..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4a7c59] resize-none"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submittingReview ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : "Kirim Ulasan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
