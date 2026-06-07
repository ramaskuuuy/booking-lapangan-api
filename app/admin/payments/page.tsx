"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" }, cache: "no-store" });

const statusColor: Record<string, string> = {
  paid:    "bg-green-100 text-green-700",
  unpaid:  "bg-yellow-100 text-yellow-700",
  failed:  "bg-red-100 text-red-500",
  refunded:"bg-blue-100 text-blue-700",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch(`${API_BASE}/payments?per_page=50`).then(r => r.json())
      .then(data => setPayments(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    p.booking?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.transaction_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Payment History</h1>
      <p className="text-gray-500 text-sm mb-6">Riwayat semua pembayaran</p>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari user atau transaction ID..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Transaction ID","User","Lapangan","Jumlah","Metode","Status","Tanggal"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Belum ada pembayaran</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-700">{p.transaction_id ?? "-"}</td>
                <td className="py-3 px-4 text-gray-600">{p.booking?.user?.name ?? "-"}</td>
                <td className="py-3 px-4 text-gray-600">{p.booking?.court?.name ?? "-"}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">Rp {Number(p.amount).toLocaleString("id-ID")}</td>
                <td className="py-3 px-4 text-gray-500 capitalize">{p.payment_method || "-"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
