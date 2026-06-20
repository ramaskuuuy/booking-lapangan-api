"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, XCircle, ImageIcon, ExternalLink, Loader2 } from "lucide-react";

const API_BASE    = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
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
  paid:                 "bg-green-100 text-green-700",
  unpaid:               "bg-yellow-100 text-yellow-700",
  waiting_confirmation: "bg-orange-100 text-orange-600",
  refunded:             "bg-blue-100 text-blue-700",
};

export default function OwnerPayments() {
  const [payments, setPayments]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [actionId, setActionId]   = useState<number | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Reuse endpoint yang sudah ada; backend filter status waiting_confirmation
      const res  = await authFetch(`${API_BASE}/payments/pending-confirmations`);
      const data = await res.json();
      setPayments(data.data ?? []);
    } catch { setPayments([]); }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const filtered = payments.filter((p) =>
    p.booking?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.booking?.court?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async (id: number) => {
    setActionId(id); setError(""); setSuccess("");
    try {
      const res  = await authFetch(`${API_BASE}/payments/${id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengkonfirmasi.");
      setSuccess("Pembayaran berhasil dikonfirmasi!");
      setTimeout(() => setSuccess(""), 3500);
      await fetchPayments();
    } catch (e: any) { setError(e.message ?? "Terjadi kesalahan."); }
    setActionId(null);
  };

  const handleReject = async (id: number) => {
    setActionId(id); setError(""); setSuccess("");
    try {
      const res  = await authFetch(`${API_BASE}/payments/${id}/reject`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menolak.");
      setSuccess("Bukti pembayaran ditolak. User perlu upload ulang.");
      setTimeout(() => setSuccess(""), 3500);
      await fetchPayments();
    } catch (e: any) { setError(e.message ?? "Terjadi kesalahan."); }
    setActionId(null);
  };

  return (
    <>
      {/* Proof Image Modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setProofModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <img src={proofModal} alt="Bukti pembayaran" className="w-full max-h-[80vh] object-contain" />
            <div className="p-3 text-center">
              <a href={proofModal} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#4a7c59] font-semibold hover:underline">
                <ExternalLink size={12} /> Buka di tab baru
              </a>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Verifikasi Pembayaran</h1>
        <p className="text-gray-500 text-sm mb-6">Konfirmasi atau tolak bukti pembayaran dari pelanggan</p>

        {error   && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">✓ {success}</div>}

        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama pelanggan atau lapangan..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59]" />
        </div>

        {/* Empty state — semua terkonfirmasi */}
        {!loading && payments.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <Search size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">Tidak ditemukan hasil pencarian.</p>
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-green-200 mb-3" />
            <p className="text-gray-700 font-semibold">Tidak ada pembayaran yang perlu dikonfirmasi</p>
            <p className="text-gray-400 text-sm mt-1">Semua bukti pembayaran sudah diproses.</p>
          </div>
        )}

        {/* Cards per payment */}
        <div className="space-y-4">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          )) : filtered.map((p) => {
            const proofUrl    = getProofUrl(p.proof_image);
            const isActioning = actionId === p.id;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Bukti Transfer */}
                  <div className="shrink-0 w-full sm:w-32">
                    {proofUrl ? (
                      <button onClick={() => setProofModal(proofUrl)} className="w-full h-28 sm:h-full rounded-xl overflow-hidden border border-gray-200 hover:border-[#4a7c59] transition-colors group">
                        <img src={proofUrl} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </button>
                    ) : (
                      <div className="w-full h-28 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-extrabold text-gray-900">
                          {p.booking?.user?.name ?? "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Lapangan: <span className="font-medium text-gray-700">{p.booking?.court?.name ?? "-"}</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {p.status === "waiting_confirmation" ? "Menunggu Konfirmasi" : p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-4">
                      {[
                        ["Jumlah Tagihan",    `Rp ${Number(p.amount).toLocaleString("id-ID")}`],
                        ["Transfer Dikirim",  p.transferred_amount ? `Rp ${Number(p.transferred_amount).toLocaleString("id-ID")}` : "-"],
                        ["Metode",            p.payment_method || "-"],
                        ["Upload Pada",       p.proof_uploaded_at ? new Date(p.proof_uploaded_at).toLocaleString("id-ID") : "-"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => handleConfirm(p.id)} disabled={isActioning}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a7c59] hover:bg-[#3a6347] text-white text-sm font-semibold transition-colors disabled:opacity-60">
                        {isActioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Konfirmasi
                      </button>
                      <button onClick={() => handleReject(p.id)} disabled={isActioning}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60">
                        {isActioning ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Tolak
                      </button>
                      {proofUrl && (
                        <button onClick={() => setProofModal(proofUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                          <ImageIcon size={14} /> Lihat Bukti
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
