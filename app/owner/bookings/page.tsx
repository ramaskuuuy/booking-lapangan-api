"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, CalendarDays, Eye, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_BASE = API_BASE.replace(/\/api\/?$/, "");
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, { ...opts, headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", ...(opts?.headers ?? {}) } });

const getProofUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE}/storage/${path.replace(/^\/+/, "")}`;
};

const statusColor: Record<string, string> = {
  confirmed:            "bg-green-100 text-green-700",
  completed:            "bg-blue-100 text-blue-700",
  pending:              "bg-yellow-100 text-yellow-700",
  cancelled:            "bg-red-100 text-red-500",
  waiting_confirmation: "bg-orange-100 text-orange-600",
};

const statusLabel: Record<string, string> = {
  pending:              "Pending",
  confirmed:            "Dikonfirmasi",
  completed:            "Selesai",
  cancelled:            "Dibatalkan",
  waiting_confirmation: "Menunggu Konfirmasi",
};

function formatDate(raw: string | null) {
  if (!raw) return "-";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export default function OwnerBookings() {
  const [bookings, setBookings]         = useState<any[]>([]);
  const [courts, setCourts]             = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCourt, setFilterCourt]   = useState("");
  const [detail, setDetail]             = useState<any | null>(null);
  
  const [actioning, setActioning]       = useState(false);
  const [rejectModal, setRejectModal]   = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "100" });
      if (filterStatus) params.set("status", filterStatus);
      if (filterCourt)  params.set("court_id", filterCourt);

      const [bRes, cRes] = await Promise.all([
        authFetch(`${API_BASE}/owner/bookings?${params}`),
        authFetch(`${API_BASE}/courts?per_page=100`),
      ]);

      const bData = await bRes.json();
      const cData = await cRes.json();
      setBookings(bData.data ?? []);
      setCourts(cData.data ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    setActioning(true);
    try {
      const res = await authFetch(`${API_BASE}/owner/bookings/${id}/confirm`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengkonfirmasi booking.");
      }
      setDetail(null);
      await fetchBookings();
    } catch (e: any) {
      alert(e.message);
    }
    setActioning(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Alasan penolakan wajib diisi."); return; }
    setActioning(true);
    try {
      const res = await authFetch(`${API_BASE}/owner/bookings/${rejectModal.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ cancellation_reason: rejectReason }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menolak booking.");
      }
      setRejectModal(null);
      setRejectReason("");
      setDetail(null);
      await fetchBookings();
    } catch (e: any) {
      alert(e.message);
    }
    setActioning(false);
  };

  useEffect(() => { fetchBookings(); }, [filterStatus, filterCourt]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      b.user?.name?.toLowerCase().includes(q) ||
      b.court?.name?.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  return (
    <>
      {/* Detail Modal */}
      {detail && !rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <h3 className="text-lg font-extrabold text-gray-900">Detail Booking</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm overflow-y-auto pr-2 pb-2">
              {[
                ["Booking ID",   `BK${String(detail.id).padStart(3, "0")}`],
                ["Pelanggan",    detail.user?.name ?? "-"],
                ["Email",        detail.user?.email ?? "-"],
                ["No. HP",       detail.user?.phone ?? "-"],
                ["Lapangan",     detail.court?.name ?? "-"],
                ["Sport",        detail.court?.sport_type ?? "-"],
                ["Tanggal",      formatDate(detail.date)],
                ["Waktu",        `${detail.start_time ?? "-"} – ${detail.end_time ?? "-"}`],
                ["Total Harga",  `Rp ${Number(detail.total_price).toLocaleString("id-ID")}`],
                ["Status",       statusLabel[detail.status] ?? detail.status],
                ["Dibuat",       formatDate(detail.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-32 text-gray-400 font-medium shrink-0">{label}</span>
                  <span className="text-gray-900 font-semibold">{value}</span>
                </div>
              ))}
              {detail.cancellation_reason && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-red-100">
                  <span className="w-32 text-red-400 font-medium shrink-0">Alasan Tolak</span>
                  <span className="text-red-700 font-semibold">{detail.cancellation_reason}</span>
                </div>
              )}
            </div>
            {detail.payment && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Info Pembayaran</p>
                <div className="space-y-2 text-sm">
                  {[
                    ["Status Bayar",  detail.payment.status],
                    ["Metode",        detail.payment.payment_method || "-"],
                    ["Transaction ID",detail.payment.transaction_id || "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <span className="w-32 text-gray-400 font-medium shrink-0">{label}</span>
                      <span className="text-gray-900 font-semibold capitalize">{value}</span>
                    </div>
                  ))}
                  {detail.payment.proof_image && (
                    <div className="flex gap-3 pt-2">
                      <span className="w-32 text-gray-400 font-medium shrink-0">Bukti Transfer</span>
                      <a href={getProofUrl(detail.payment.proof_image) || "#"} target="_blank" rel="noreferrer" className="text-[#4a7c59] font-semibold hover:underline flex items-center gap-1">
                        Lihat Gambar
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(detail.status === "pending" || detail.payment?.status === "waiting_confirmation") && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
                <button onClick={() => setRejectModal(detail)} disabled={actioning}
                  className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 disabled:opacity-60 transition-colors">
                  Tolak Booking
                </button>
                <button onClick={() => handleConfirm(detail.id)} disabled={actioning}
                  className="flex-1 py-2.5 bg-[#4a7c59] hover:bg-[#3a6347] text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors">
                  {actioning ? "Memproses..." : "Konfirmasi Booking"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Tolak Booking</h3>
            <p className="text-sm text-gray-500 mb-4">Berikan alasan penolakan untuk booking <b>BK{String(rejectModal.id).padStart(3, "0")}</b>. Saldo jika sudah dibayar akan diproses manual.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Lapangan sedang dalam perbaikan dadakan..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 focus:outline-none focus:border-[#4a7c59] resize-none h-24"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleReject} disabled={actioning} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-500 hover:bg-red-600 text-white disabled:opacity-60">
                {actioning ? "Menolak..." : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Daftar Booking</h1>
        <p className="text-gray-500 text-sm mb-6">Semua booking dari lapangan milik kamu</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total",       value: stats.total,     bg: "bg-blue-50",   text: "text-blue-700" },
            { label: "Pending",     value: stats.pending,   bg: "bg-yellow-50", text: "text-yellow-700" },
            { label: "Konfirmasi",  value: stats.confirmed, bg: "bg-green-50",  text: "text-green-700" },
            { label: "Dibatalkan",  value: stats.cancelled, bg: "bg-red-50",    text: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
              <p className={`text-2xl font-extrabold mt-1 ${s.text}`}>{loading ? "..." : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama pelanggan atau lapangan..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59]" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59]">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="waiting_confirmation">Menunggu Konfirmasi</option>
          </select>
          <select value={filterCourt} onChange={(e) => setFilterCourt(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59]">
            <option value="">Semua Lapangan</option>
            {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Booking ID", "Pelanggan", "Lapangan", "Tanggal", "Waktu", "Total", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <CalendarDays size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Belum ada booking</p>
                </td></tr>
              ) : filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">BK{String(b.id).padStart(3, "0")}</td>
                  <td className="py-3 px-4 text-gray-600">{b.user?.name ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-600">{b.court?.name ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(b.date)}</td>
                  <td className="py-3 px-4 text-gray-500">{b.start_time ?? "-"} – {b.end_time ?? "-"}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">Rp {Number(b.total_price).toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setDetail(b)} className="p-1.5 text-gray-400 hover:text-[#4a7c59] hover:bg-green-50 rounded-lg transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <p className="mt-3 text-xs text-gray-400 text-right">
            Menampilkan {filtered.length} dari {bookings.length} booking
          </p>
        )}
      </div>
    </>
  );
}
