"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X, AlertTriangle, Loader2, MapPin } from "lucide-react";

const API_BASE    = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_BASE = API_BASE.replace(/\/api\/?$/, "");

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const authFetch = (url: string, opts: RequestInit = {}) => {
  const headers = new Headers(opts.headers || {});
  const token   = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isFormData) headers.set("Content-Type", "application/json");
  else headers.delete("Content-Type");
  return fetch(url, { ...opts, headers });
};

const getImageUrl = (image?: string | null) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${STORAGE_BASE}/storage/${image.replace(/^\/+/, "")}`;
};

type FormState = {
  name: string; location: string; sport_type: string; type: string;
  price_per_hour: string; facilities: string; description: string;
  is_active: boolean; image: File | null;
};

const initialForm: FormState = {
  name: "", location: "", sport_type: "", type: "indoor",
  price_per_hour: "", facilities: "", description: "", is_active: true, image: null,
};

export default function OwnerLapangan() {
  const [courts, setCourts]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<any | null>(null);
  const [form, setForm]             = useState<FormState>(initialForm);
  const [saving, setSaving]         = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      // Endpoint GET /courts — backend akan filter by owner_id jika role pemilik_lapangan
      const res  = await authFetch(`${API_BASE}/courts?per_page=100`);
      const data = await res.json();
      setCourts(data.data ?? []);
    } catch { setCourts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchCourts(); }, []);

  const filtered = useMemo(
    () => courts.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase())),
    [courts, search]
  );

  const openCreate = () => {
    setEditing(null); setForm(initialForm); setImagePreview(""); setError(""); setShowModal(true);
  };

  const openEdit = (court: any) => {
    setEditing(court); setError("");
    const facilitiesText = Array.isArray(court.facilities)
      ? court.facilities.join(", ")
      : (() => { try { const p = JSON.parse(court.facilities || "[]"); return Array.isArray(p) ? p.join(", ") : court.facilities; } catch { return court.facilities ?? ""; } })();

    setForm({ name: court.name ?? "", location: court.location ?? "", sport_type: court.sport_type ?? "",
      type: court.type ?? "indoor", price_per_hour: String(court.price_per_hour ?? ""),
      facilities: facilitiesText, description: court.description ?? "",
      is_active: Boolean(court.is_active), image: null });
    setImagePreview(getImageUrl(court.image));
    setShowModal(true);
  };

  const handleFileChange = (file: File | null) => {
    setForm((p) => ({ ...p, image: file }));
    if (file) { setImagePreview(URL.createObjectURL(file)); return; }
    setImagePreview(editing?.image ? getImageUrl(editing.image) : "");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.sport_type || !form.price_per_hour) {
      setError("Nama, jenis olahraga, dan harga wajib diisi."); return;
    }
    setSaving(true);
    try {
      const facilities = form.facilities.split(",").map((f) => f.trim()).filter(Boolean);
      const payload    = new FormData();
      payload.append("name", form.name);
      payload.append("location", form.location);
      payload.append("sport_type", form.sport_type);
      payload.append("type", form.type);
      payload.append("price_per_hour", String(Number(form.price_per_hour || 0)));
      payload.append("description", form.description);
      payload.append("is_active", form.is_active ? "1" : "0");
      facilities.forEach((f) => payload.append("facilities[]", f));
      if (form.image) payload.append("image", form.image);

      let res: Response;
      if (editing) {
        payload.append("_method", "PUT");
        res = await authFetch(`${API_BASE}/courts/${editing.id}`, { method: "POST", body: payload });
      } else {
        res = await authFetch(`${API_BASE}/courts`, { method: "POST", body: payload });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || Object.values(err.errors ?? {}).flat().join(", ") || "Gagal menyimpan");
      }

      setShowModal(false); setEditing(null); setForm(initialForm); setImagePreview("");
      setSuccess(editing ? "Lapangan berhasil diperbarui." : "Lapangan berhasil ditambahkan.");
      setTimeout(() => setSuccess(""), 3500);
      await fetchCourts();
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res  = await authFetch(`${API_BASE}/courts/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus.");
      setCourts((p) => p.filter((c) => c.id !== deleteTarget.id));
      setSuccess(`Lapangan "${deleteTarget.name}" berhasil dihapus.`);
      setTimeout(() => setSuccess(""), 3500);
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e.message ?? "Terjadi kesalahan.");
    } finally { setDeleting(false); }
  };

  return (
    <>
      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Hapus Lapangan?</h3>
              <p className="text-gray-500 text-sm">Lapangan <strong>{deleteTarget.name}</strong> akan dihapus permanen beserta semua datanya.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Menghapus...</> : <><Trash2 className="h-4 w-4" /> Ya, Hapus</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Lapangan Saya</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola lapangan milik kamu</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus size={18} /> Tambah Lapangan
          </button>
        </div>

        {success && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">✓ {success}</div>}
        {error && !showModal && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari lapangan..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Lapangan", "Pemilik", "Lokasi", "Sport", "Tipe", "Harga/Jam", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <MapPin size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-medium">Belum ada lapangan</p>
                  <p className="text-gray-300 text-xs mt-1">Klik "Tambah Lapangan" untuk mulai</p>
                </td></tr>
              ) : filtered.map((court) => (
                <tr key={court.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {court.image ? (
                        <img src={getImageUrl(court.image)} alt={court.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <ImageIcon size={16} className="text-gray-300" />
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{court.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold text-[#4a7c59] bg-green-50 px-2 py-1 rounded-md">
                      {court.owner?.name ?? "Tidak ada"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{court.location ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{court.sport_type}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{court.type}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">Rp {Number(court.price_per_hour).toLocaleString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${court.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                      {court.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(court)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(court)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">{editing ? "Edit Lapangan" : "Tambah Lapangan"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}

            <div className="space-y-4">
              {[
                { label: "Nama Lapangan *", key: "name", type: "text" },
                { label: "Lokasi / Alamat", key: "location", type: "text" },
                { label: "Harga Per Jam (Rp) *", key: "price_per_hour", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <input type={type} value={(form as any)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]" />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Olahraga *</label>
                <select value={form.sport_type} onChange={(e) => setForm((p) => ({ ...p, sport_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]">
                  <option value="">Pilih...</option>
                  {["futsal", "badminton", "basketball", "padel", "tenis"].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipe</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]">
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fasilitas <span className="text-gray-400 font-normal">(pisahkan dengan koma)</span></label>
                <input type="text" placeholder="Parkir, Toilet, Kantin" value={form.facilities}
                  onChange={(e) => setForm((p) => ({ ...p, facilities: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Foto Lapangan</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700">
                    <ImageIcon size={16} /> Pilih Foto
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                  </label>
                  <span className="text-xs text-gray-500">JPG, PNG, WEBP. Maks 2MB.</span>
                </div>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl border border-gray-200" />
                ) : (
                  <div className="mt-3 w-full h-40 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                    Belum ada foto
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="accent-[#4a7c59] w-4 h-4" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Lapangan Aktif</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-[#4a7c59] hover:bg-[#3a6347] text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
