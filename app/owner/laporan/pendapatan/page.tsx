"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";

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

type RevenueData = {
  period: string;
  revenue: number;
  bookings_count: number;
};

export default function LaporanPendapatan() {
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState<RevenueData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_BASE}/owner/reports/revenue?period=${period}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData.data ?? []);
        setTotal(resData.total_revenue ?? 0);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Laporan Pendapatan</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau total pendapatan dari lapangan milik Anda</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#4a7c59]"
        >
          <option value="daily">Harian (30 Hari Terakhir)</option>
          <option value="weekly">Mingguan (12 Minggu Terakhir)</option>
          <option value="monthly">Bulanan (12 Bulan Terakhir)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#4a7c59] rounded-2xl p-6 text-white shadow-sm md:col-span-1">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-white/80 font-medium text-sm">Total Pendapatan</p>
          <p className="text-3xl font-extrabold mt-1">
            {loading ? "..." : `Rp ${total.toLocaleString("id-ID")}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2">
          <p className="text-sm font-bold text-gray-900 mb-4">Ringkasan Grafik</p>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : data.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <Calendar size={32} className="mb-2 text-gray-200" />
              <p className="text-sm">Belum ada pendapatan di periode ini</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40 mt-6 relative w-full overflow-x-auto pb-6">
              {data.map((d, i) => {
                const max = Math.max(...data.map((x) => x.revenue));
                const height = max === 0 ? 0 : (d.revenue / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[40px]">
                    <div
                      className="w-full bg-green-100 rounded-t-sm group-hover:bg-[#4a7c59] transition-colors relative"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap transition-opacity z-10 pointer-events-none">
                        Rp {d.revenue.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 absolute bottom-0">{d.period.split("-").pop()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Periode</th>
              <th className="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase">Jumlah Booking Lunas</th>
              <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase">Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={3} className="py-4 px-6"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={3} className="py-16 text-center text-gray-400">Tidak ada data</td></tr>
            ) : (
              data.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">{d.period}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{d.bookings_count}</td>
                  <td className="py-4 px-6 text-right font-bold text-[#4a7c59]">Rp {d.revenue.toLocaleString("id-ID")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
