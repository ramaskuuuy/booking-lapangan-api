"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Tag } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json", ...(opts?.headers ?? {}) },
  });

type PromoScope = "all" | "sport" | "court";

type PromoFormState = {
  promo_scope: PromoScope; court_id: string; sport_type: string;
  title: string; code: string; description: string; discount_percent: string;
  valid_from: string; valid_until: string; is_active: boolean; banner_image: File | null;
};

export default function OwnerPromo() {
  const [promos, setPromos]       = useState<any[]>([]);
  const [courts, setCourts]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<any | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const [form, setForm] = useState<PromoFormState>({
    promo_scope: "court", court_id: "", sport_type: "",
    title: "", code: "", description: "", discount_percent: "",
    valid_from: "", valid_until: "", is_active: true, banner_image: null,
  });

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        authFetch(`${API_BASE}/promotions`),
        authFetch(`${API_BASE}/courts?per_page=100`), // courts milik owner (backend filter)
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      // Filter promo: hanya yang court_id-nya ada di lapangan milik owner
      const ownerCourtIds = (cData.data ?? []).map((c: any) => c.id);
      const allPromos     = Array.isArray(pData) ? pData : pData.data ?? [];
      setPromos(allPromos.filter((p: any) => ownerCourtIds.includes(p.court_id)));
      setCourts(cData.data ?? []);
    } catch { setPromos([]); setCourts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null); setError("");
    setForm({ promo_scope: "court", court_id: courts[0]?.id?.toString() ?? "", sport_type: "",
      title: "", code: "", description: "", discount_percent: "",
      valid_from: "", valid_until: "", is_active: true, banner_image: null });
    setShowModal(true);
  };

  const openEdit = (promo: any) => {
    setEditing(promo); setError("");
    let promo_scope: PromoScope = "all";
    if (promo.court_id) promo_scope = "court";
    else if (promo.sport_type) promo_scope = "sport";
    setForm({
      promo_scope, court_id: promo.court_id ? String(promo.court_id) : "",
      sport_type: promo.sport_type ?? "", title: promo.title ?? "", code: promo.code ?? "",
      description: promo.description ?? "", discount_percent: promo.discount_percent ?? "",
      valid_from: promo.valid_from?.slice(0, 10) ?? "", valid_until: promo.valid_until?.slice(0, 10) ?? "",
      is_active: promo.is_active ?? true, banner_image: null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.title || !form.discount_percent || !form.valid_from || !form.valid_until) {
      setError("Judul, diskon, dan tanggal wajib diisi."); return;
    }
    if (form.promo_scope === "court" && !form.court_id) {
      setError("Pilih lapangan terlebih dahulu."); return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append("court_id", form.promo_scope === "court" ? String(form.court_id) : "");
    formData.append("sport_type", form.promo_scope === "sport" ? form.sport_type : "");
    formData.append("title", form.title);
    formData.append("code", form.code);
    formData.append("description", form.description);
    formData.append("discount_percent", String(form.discount_percent));
    formData.append("valid_from", form.valid_from);
    formData.append("valid_until", form.valid_until);
    formData.append("is_active", form.is_active ? "1" : "0");
    if (form.banner_image) formData.append("banner_image", form.banner_image);

    try {
      const res = editing
        ? await authFetch(`${API_BASE}/promotions/${editing.id}`, { method: "POST", body: (() => { formData.append("_method", "PUT"); return formData; })() })
        : await authFetch(`${API_BASE}/promotions`, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.message ?? Object.values(err.errors ?? {}).flat().join(", ");
        setError(msg || "Gagal menyimpan."); setSaving(false); return;
      }

      setShowModal(false);
      setSuccess(editing ? "Promo berhasil diperbarui." : "Promo berhasil ditambahkan.");
      setTimeout(() => setSuccess(""), 3500);
      await fetchData();
    } catch { setError("Terjadi kesalahan. Coba lagi."); }
    setSaving(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus promo "${title}"?`)) return;
    try {
      await authFetch(`${API_BASE}/promotions/${id}`, { method: "DELETE" });
      setSuccess(`Promo "${title}" berhasil dihapus.`);
      setTimeout(() => setSuccess(""), 3500);
      fetchData();
    } catch { setError("Gagal menghapus promo."); }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Promo & Diskon</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola kode promo untuk lapangan kamu</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus size={18} /> Tambah Promo
          </button>
        </div>

        {success && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">✓ {success}</div>}
        {error && !showModal && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Judul", "Kode", "Lapangan", "Diskon", "Berlaku", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : promos.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Tag size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Belum ada promo</p>
                  <p className="text-gray-300 text-xs mt-1">Klik "Tambah Promo" untuk membuat diskon</p>
                </td></tr>
              ) : promos.map((p) => {
                const isExpired = p.valid_until < today;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{p.title}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#4a7c59] tracking-widest">{p.code ?? "-"}</td>
                    <td className="py-3 px-4 text-gray-500">{courts.find((c) => c.id === p.court_id)?.name ?? (p.sport_type ? `Semua ${p.sport_type}` : "Semua Lapangan")}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{Number(p.discount_percent)}%</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {p.valid_from?.slice(0, 10)} → {p.valid_until?.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isExpired ? "bg-gray-100 text-gray-400" : p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                        {isExpired ? "Kedaluwarsa" : p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">{editing ? "Edit Promo" : "Tambah Promo"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

            <div className="space-y-4">
              {/* Lapangan (hanya milik owner) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lapangan <span className="text-red-400">*</span></label>
                <select value={form.court_id} onChange={(e) => setForm((p) => ({ ...p, court_id: e.target.value, promo_scope: "court" }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]">
                  <option value="">Pilih lapangan...</option>
                  {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {[
                { label: "Judul Promo *", key: "title", type: "text" },
                { label: "Kode Promo", key: "code", type: "text", placeholder: "FUTSAL30" },
                { label: "Diskon (%) *", key: "discount_percent", type: "number" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: key === "code" ? e.target.value.toUpperCase() : e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Berlaku Dari *</label>
                  <input type="date" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Berlaku Hingga *</label>
                  <input type="date" value={form.valid_until} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi</label>
                <textarea rows={2} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Banner Promo</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setForm((p) => ({ ...p, banner_image: e.target.files?.[0] || null }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                {form.banner_image && <p className="text-xs text-green-600 mt-1">{form.banner_image.name}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="promo_active" checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="accent-[#4a7c59] w-4 h-4" />
                <label htmlFor="promo_active" className="text-sm font-medium text-gray-700">Promo Aktif</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#4a7c59] hover:bg-[#3a6347] text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
