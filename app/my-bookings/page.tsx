"use client";

import Navbar from "@/components/Navbar";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/library/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  useEffect(() => {
    const token = getToken();
    if (!token) { setError("Silakan login terlebih dahulu."); setLoading(false); return; }

    fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(r => r.json())
      .then(data => setBookings(data.data ?? []))
      .catch(() => setError("Gagal memuat riwayat booking."))
      .finally(() => setLoading(false));
  }, []);

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
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 mb-1">Total Biaya</p>
                    <p className="text-xl font-extrabold text-[#4a7c59]">
                      Rp {Number(booking.total_price).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
