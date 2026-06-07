"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, CalendarDays, TrendingUp } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" }, cache: "no-store" });

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courts: 0, users: 0, bookings: 0, todayBookings: 0, revenue: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [popularCourts, setPopularCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch(`${API_BASE}/admin/dashboard`).then(r => r.json()).catch(() => null),
      authFetch(`${API_BASE}/bookings?per_page=10`).then(r => r.json()).catch(() => ({ data: [] })),
      authFetch(`${API_BASE}/courts`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([dashboard, bookings, courts]) => {
      if (dashboard) setStats(dashboard);
      setRecentBookings(bookings?.data ?? []);
      setPopularCourts((courts?.data ?? []).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    pending:   "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statCards = [
    { label: "Total Fields",    value: stats.courts,        sub: "+ 2 this month", icon: MapPin,       color: "bg-green-50 text-green-600" },
    { label: "Total Users",     value: stats.users,         sub: "+ 4 this week",  icon: Users,        color: "bg-blue-50 text-blue-600" },
    { label: "Total Bookings",  value: stats.bookings,      sub: "+ 2 this week",  icon: CalendarDays, color: "bg-purple-50 text-purple-600" },
    { label: "Today's Booking", value: stats.todayBookings, sub: "Active Now",     icon: TrendingUp,   color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome back! Here's what's happening today</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{loading ? "..." : card.value}</p>
                <p className="text-xs text-green-500 font-medium">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-[#4a7c59] hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">Booking ID</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">User</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">Field</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={5} className="py-3 px-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada booking</td></tr>
                ) : recentBookings.map((b, i) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">BK{String(i + 1).padStart(3, "0")}</td>
                    <td className="py-3 px-3 text-gray-600">{b.user?.name ?? "-"}</td>
                    <td className="py-3 px-3 text-gray-600">{b.court?.name ?? "-"}</td>
                    <td className="py-3 px-3 text-gray-600">{b.date}</td>
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

        {/* Right column */}
        <div className="space-y-5">
          {/* Total Revenue */}
          <div className="bg-[#4a7c59] rounded-2xl p-6 text-white">
            <p className="text-green-200 text-sm font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-extrabold mb-1">
              Rp {loading ? "..." : Number(stats.revenue).toLocaleString("id-ID")}
            </p>
            <p className="text-green-200 text-xs">All time earnings</p>
          </div>

          {/* Popular Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900">Popular Fields</h2>
              <Link href="/admin/lapangan" className="text-sm text-[#4a7c59] hover:underline font-medium">View All</Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : popularCourts.map((court) => (
                <div key={court.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={court.image ? `http://127.0.0.1:8000/storage/${court.image}` : "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=100&q=80"}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{court.name}</p>
                    <p className="text-xs text-gray-400">{court.sport_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
