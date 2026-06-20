"use client";

import { useEffect, useState } from "react";
import { MapPin, CalendarDays, Clock, CheckCircle2, XCircle, TrendingUp, Tag } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" }, cache: "no-store" });

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-500",
  waiting_confirmation: "bg-orange-100 text-orange-700",
};

export default function OwnerDashboard() {
  const [stats, setStats]               = useState<any>(null);
  const [recentBookings, setRecent]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE}/owner/dashboard`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats ?? null);
        setRecent(data.recent_bookings ?? []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Lapangan",   value: stats?.total_courts      ?? 0, icon: MapPin,        color: "bg-green-50 text-green-600" },
    { label: "Total Booking",    value: stats?.total_bookings     ?? 0, icon: CalendarDays,  color: "bg-blue-50 text-blue-600" },
    { label: "Booking Pending",  value: stats?.pending_bookings   ?? 0, icon: Clock,         color: "bg-yellow-50 text-yellow-600" },
    { label: "Dikonfirmasi",     value: stats?.confirmed_bookings ?? 0, icon: CheckCircle2,  color: "bg-emerald-50 text-emerald-600" },
    { label: "Dibatalkan",       value: stats?.cancelled_bookings ?? 0, icon: XCircle,       color: "bg-red-50 text-red-500" },
    { label: "Total Pendapatan", value: stats?.total_revenue      ?? 0, icon: TrendingUp,    color: "bg-purple-50 text-purple-600", isCurrency: true },
    { label: "Promo Aktif",      value: stats?.active_promos      ?? 0, icon: Tag,           color: "bg-orange-50 text-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Selamat datang! Berikut ringkasan lapangan kamu hari ini.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium truncate">{card.label}</p>
                <p className="text-xl font-extrabold text-gray-900">
                  {loading ? "..." : card.isCurrency
                    ? `Rp ${Number(card.value).toLocaleString("id-ID")}`
                    : card.value
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-gray-900">Booking Terbaru</h2>
          <Link href="/owner/bookings" className="text-sm text-[#4a7c59] hover:underline font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Booking ID", "Pelanggan", "Lapangan", "Tanggal", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="py-3 px-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : recentBookings.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Belum ada booking</td></tr>
              ) : recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900">{b.booking_code}</td>
                  <td className="py-3 px-3 text-gray-600">{b.user_name}</td>
                  <td className="py-3 px-3 text-gray-600">{b.court_name}</td>
                  <td className="py-3 px-3 text-gray-500">{b.booking_date}</td>
                  <td className="py-3 px-3 font-medium text-gray-900">Rp {Number(b.total_price).toLocaleString("id-ID")}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
