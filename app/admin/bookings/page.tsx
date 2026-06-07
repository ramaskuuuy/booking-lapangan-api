"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", "Content-Type": "application/json", ...(opts?.headers ?? {}) } });

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-500",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchBookings = async () => {
    const res = await authFetch(`${API_BASE}/bookings?per_page=50`);
    const data = await res.json();
    setBookings(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.court?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? b.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (id: number, status: string) => {
    await authFetch(`${API_BASE}/bookings/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    fetchBookings();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Manage Bookings</h1>
      <p className="text-gray-500 text-sm mb-6">Kelola semua booking lapangan</p>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari user atau lapangan..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59]">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Booking ID", "User", "Lapangan", "Tanggal", "Waktu", "Total", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={8} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-gray-400">Belum ada booking</td></tr>
            ) : filtered.map((b, i) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-gray-900">BK{String(i+1).padStart(3,"0")}</td>
                <td className="py-3 px-4 text-gray-600">{b.user?.name ?? "-"}</td>
                <td className="py-3 px-4 text-gray-600">{b.court?.name ?? "-"}</td>
                <td className="py-3 px-4 text-gray-600">{b.date}</td>
                <td className="py-3 px-4 text-gray-600">{b.start_time} - {b.end_time}</td>
                <td className="py-3 px-4 font-medium text-gray-900">Rp {Number(b.total_price).toLocaleString("id-ID")}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select value={b.status} onChange={e => handleUpdateStatus(b.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#4a7c59]">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
