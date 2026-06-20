"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, CalendarDays } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
      ...(opts?.headers ?? {}),
    },
  });

function formatDate(raw: string | null) {
  if (!raw) return "-";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default function LaporanTransaksi() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Kita panggil GET payments (kita ubah endpoint atau buat baru? Oh, tadi kita buat `/owner/reports/transactions`)
    authFetch(`${API_BASE}/owner/reports/transactions`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Laporan Transaksi</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar semua pembayaran yang terjadi di lapangan Anda</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Transaction ID", "Waktu", "Pelanggan", "Lapangan", "Metode", "Status Bayar", "Total"].map((h) => (
                <th key={h} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-4 px-6"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                Belum ada transaksi
              </td></tr>
            ) : (
              transactions.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{t.transaction_id ?? "-"}</td>
                  <td className="py-4 px-6 text-gray-500">{formatDate(t.created_at)}</td>
                  <td className="py-4 px-6 font-semibold text-gray-900">{t.booking?.user?.name ?? "-"}</td>
                  <td className="py-4 px-6 text-gray-600">{t.booking?.court?.name ?? "-"}</td>
                  <td className="py-4 px-6 text-gray-600">{t.payment_method ?? "-"}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === "paid" ? "bg-green-100 text-green-700" : t.status === "refunded" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-900">
                    Rp {Number(t.amount).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
