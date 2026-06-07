"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

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

type PromoScope = "all" | "sport" | "court";

type PromoFormState = {
  promo_scope: PromoScope;
  court_id: string;
  sport_type: string;
  title: string;
  code: string;
  description: string;
  discount_percent: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  banner_image: File | null;
};

export default function AdminPromo() {
  const [promos, setPromos] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PromoFormState>({
    promo_scope: "court",
    court_id: "",
    sport_type: "",
    title: "",
    code: "",
    description: "",
    discount_percent: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
    banner_image: null,
  });

  const fetchData = async () => {
    try {
      const [promoRes, courtRes] = await Promise.all([
        authFetch(`${API_BASE}/promotions`),
        authFetch(`${API_BASE}/courts?per_page=50`),
      ]);

      const promoData = await promoRes.json();
      const courtData = await courtRes.json();

      setPromos(Array.isArray(promoData) ? promoData : promoData.data ?? []);
      setCourts(courtData.data ?? []);
    } catch {
      setPromos([]);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setError("");
    setForm({
      promo_scope: "court",
      court_id: "",
      sport_type: "",
      title: "",
      code: "",
      description: "",
      discount_percent: "",
      valid_from: "",
      valid_until: "",
      is_active: true,
      banner_image: null,
    });
    setShowModal(true);
  };

  const openEdit = (promo: any) => {
    setEditing(promo);
    setError("");

    let promo_scope: PromoScope = "all";
    if (promo.court_id) promo_scope = "court";
    else if (promo.sport_type) promo_scope = "sport";

    setForm({
      promo_scope,
      court_id: promo.court_id ? String(promo.court_id) : "",
      sport_type: promo.sport_type ?? "",
      title: promo.title ?? "",
      code: promo.code ?? "",
      description: promo.description ?? "",
      discount_percent: promo.discount_percent ?? "",
      valid_from: promo.valid_from?.slice(0, 10) ?? "",
      valid_until: promo.valid_until?.slice(0, 10) ?? "",
      is_active: promo.is_active ?? true,
      banner_image: null,
    });
    setShowModal(true);
  };

  const getCoverageLabel = (promo: any) => {
    if (promo.court_id) {
      return courts.find((c) => c.id === promo.court_id)?.name ?? "-";
    }

    if (promo.sport_type) {
      const sport = String(promo.sport_type);
      return `Semua ${sport.charAt(0).toUpperCase() + sport.slice(1)}`;
    }

    return "Semua Lapangan";
  };

  const handleSave = async () => {
    setError("");

    if (!form.title || !form.discount_percent || !form.valid_from || !form.valid_until) {
      setError("Judul, diskon, dan tanggal wajib diisi.");
      return;
    }

    if (form.promo_scope === "court" && !form.court_id) {
      setError("Pilih lapangan terlebih dahulu.");
      return;
    }

    if (form.promo_scope === "sport" && !form.sport_type) {
      setError("Pilih jenis olahraga terlebih dahulu.");
      return;
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

    if (form.banner_image) {
      formData.append("banner_image", form.banner_image);
    }

    try {
      const res = editing
        ? await authFetch(`${API_BASE}/promotions/${editing.id}`, {
            method: "POST",
            body: (() => {
              formData.append("_method", "PUT");
              return formData;
            })(),
          })
        : await authFetch(`${API_BASE}/promotions`, {
            method: "POST",
            body: formData,
          });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          errData.message ??
          Object.values(errData.errors ?? {}).flat().join(", ");
        setError(msg || "Gagal menyimpan.");
        setSaving(false);
        return;
      }

      setShowModal(false);
      await fetchData();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus promo ini?")) return;
    await authFetch(`${API_BASE}/promotions/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Manage Promo</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua kode promo</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> Tambah Promo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Judul", "Kode", "Cakupan", "Diskon", "Deskripsi", "Berlaku Hingga", "Status", "Aksi"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-3 px-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  Belum ada promo
                </td>
              </tr>
            ) : (
              promos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-gray-900">{p.title}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#4a7c59] tracking-widest">
                    {p.code ?? "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{getCoverageLabel(p)}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {Number(p.discount_percent)}%
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs max-w-[200px] truncate">
                    {p.description ?? "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {p.valid_until?.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-5">
              {editing ? "Edit Promo" : "Tambah Promo"}
            </h2>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cakupan Promo <span className="text-red-400">*</span>
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="promo_scope"
                      value="all"
                      checked={form.promo_scope === "all"}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          promo_scope: e.target.value as PromoScope,
                          court_id: "",
                          sport_type: "",
                        }))
                      }
                    />
                    Semua Lapangan
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="promo_scope"
                      value="sport"
                      checked={form.promo_scope === "sport"}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          promo_scope: e.target.value as PromoScope,
                          court_id: "",
                        }))
                      }
                    />
                    Berdasarkan Jenis Olahraga
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="promo_scope"
                      value="court"
                      checked={form.promo_scope === "court"}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          promo_scope: e.target.value as PromoScope,
                          sport_type: "",
                        }))
                      }
                    />
                    Lapangan Tertentu
                  </label>
                </div>
              </div>

              {form.promo_scope === "sport" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Jenis Olahraga <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.sport_type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sport_type: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                  >
                    <option value="">Pilih olahraga...</option>
                    <option value="futsal">Futsal</option>
                    <option value="padel">Padel</option>
                    <option value="badminton">Badminton</option>
                    <option value="basketball">Basketball</option>
                    <option value="tenis">Tenis</option>
                  </select>
                </div>
              )}

              {form.promo_scope === "court" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Lapangan <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.court_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, court_id: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                  >
                    <option value="">Pilih lapangan...</option>
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Judul <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Kode Promo
                </label>
                <input
                  type="text"
                  placeholder="Contoh: FUTSAL30"
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 tracking-widest focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Diskon (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount_percent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discount_percent: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Berlaku Dari <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.valid_from}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, valid_from: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Berlaku Hingga <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, valid_until: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Banner Promo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      banner_image: e.target.files?.[0] || null,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
                {form.banner_image && (
                  <p className="text-xs text-green-600 mt-1">
                    {form.banner_image.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promo_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_active: e.target.checked }))
                  }
                  className="accent-[#4a7c59]"
                />
                <label htmlFor="promo_active" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#4a7c59] hover:bg-[#3a6347] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}