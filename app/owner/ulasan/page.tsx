"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", ...(opts?.headers ?? {}) } });

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"} />
      ))}
    </div>
  );
}

function formatDate(raw: string | null) {
  if (!raw) return "-";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/owner/reviews?per_page=100`);
      if (!res.ok) throw new Error("Gagal mengambil data ulasan");
      const data = await res.json();
      setReviews(data.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Ulasan Pelanggan</h1>
      <p className="text-gray-500 text-sm mb-6">Pantau kepuasan pelanggan terhadap lapangan Anda</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
          <p className="text-xs font-semibold text-yellow-700">Rata-Rata Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-3xl font-extrabold text-yellow-600">{loading ? "..." : averageRating}</p>
            <Star size={24} className="text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700">Total Ulasan Masuk</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{loading ? "..." : reviews.length}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Pelanggan</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Lapangan</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Komentar</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={5} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : reviews.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center">
                <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">Belum ada ulasan</p>
              </td></tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-bold text-gray-900">{r.user?.name ?? "Anonim"}</td>
                <td className="py-3 px-4 text-gray-600 font-medium">{r.court?.name ?? "-"}</td>
                <td className="py-3 px-4">
                  <StarRow count={r.rating} />
                </td>
                <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={r.comment}>
                  {r.comment ? `"${r.comment}"` : <span className="italic text-gray-400">Tidak ada komentar</span>}
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
