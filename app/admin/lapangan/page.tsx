"use client";


import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const STORAGE_BASE = API_BASE.replace(/\/api\/?$/, "");

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const authFetch = (url: string, opts: RequestInit = {}) => {
  const headers = new Headers(opts.headers || {});
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Accept", "application/json");

  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  } else {
    headers.delete("Content-Type");
  }

  return fetch(url, { ...opts, headers });
};

const getImageUrl = (image?: string | null) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${STORAGE_BASE}/storage/${image.replace(/^\/+/, "")}`;
};

type FormState = {
  name: string;
  location: string;
  sport_type: string;
  type: string;
  price_per_hour: string;
  facilities: string;
  rating: string;
  description: string;
  is_active: boolean;
  image: File | null;
};

const initialForm: FormState = {
  name: "",
  location: "",
  sport_type: "",
  type: "indoor",
  price_per_hour: "",
  facilities: "",
  rating: "",
  description: "",
  is_active: true,
  image: null,
};

export default function AdminLapangan() {
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchCourts = async () => {
    const res = await authFetch(`${API_BASE}/courts?per_page=50`);
    const data = await res.json();
    setCourts(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const filtered = useMemo(
    () => courts.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase())),
    [courts, search]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (court: any) => {
    setEditing(court);

    const facilitiesText = Array.isArray(court.facilities)
      ? court.facilities.join(", ")
      : typeof court.facilities === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(court.facilities || "[]");
              return Array.isArray(parsed) ? parsed.join(", ") : court.facilities;
            } catch {
              return court.facilities;
            }
          })()
        : "";

    setForm({
      name: court.name ?? "",
      location: court.location ?? "",
      sport_type: court.sport_type ?? "",
      type: court.type ?? "indoor",
      price_per_hour: String(court.price_per_hour ?? ""),
      facilities: facilitiesText,
      rating: String(court.rating ?? ""),
      description: court.description ?? "",
      is_active: Boolean(court.is_active),
      image: null,
    });

    setImagePreview(getImageUrl(court.image));
    setShowModal(true);
  };

  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, image: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      return;
    }

    setImagePreview(editing?.image ? getImageUrl(editing.image) : "");
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const facilities = form.facilities
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("location", form.location);
      payload.append("sport_type", form.sport_type);
      payload.append("type", form.type);
      payload.append("price_per_hour", String(Number(form.price_per_hour || 0)));
      payload.append("rating", String(Number(form.rating || 0)));
      payload.append("description", form.description);
      payload.append("is_active", form.is_active ? "1" : "0");

      facilities.forEach((facility) => {
        payload.append("facilities[]", facility);
      });

      if (form.image) {
        payload.append("image", form.image);
      }

      let res: Response;

      if (editing) {
        payload.append("_method", "PUT");
        res = await authFetch(`${API_BASE}/courts/${editing.id}`, {
          method: "POST",
          body: payload,
        });
      } else {
        res = await authFetch(`${API_BASE}/courts`, {
          method: "POST",
          body: payload,
        });
      }

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Gagal menyimpan lapangan");
      }

      setSaving(false);
      setShowModal(false);
      setEditing(null);
      setForm(initialForm);
      setImagePreview("");
      await fetchCourts();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus lapangan ini?")) return;
    await authFetch(`${API_BASE}/courts/${id}`, { method: "DELETE" });
    fetchCourts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Manage Fields</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua lapangan olahraga</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> Tambah Lapangan
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari lapangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Nama", "Lokasi", "Sport", "Tipe", "Harga/Jam", "Rating", "Status", "Aksi"].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-3 px-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  Belum ada lapangan
                </td>
              </tr>
            ) : (
              filtered.map((court) => (
                <tr key={court.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{court.name}</td>
                  <td className="py-3 px-4 text-gray-500">{court.location ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-500">{court.sport_type}</td>
                  <td className="py-3 px-4 text-gray-500 capitalize">{court.type}</td>
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    Rp {Number(court.price_per_hour).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {Number(court.rating) > 0 ? Number(court.rating).toFixed(1) : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        court.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {court.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(court)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-5">
              {editing ? "Edit Lapangan" : "Tambah Lapangan"}
            </h2>

            <div className="space-y-4">
              {[
                { label: "Nama Lapangan", key: "name", type: "text" },
                { label: "Lokasi", key: "location", type: "text" },
                { label: "Harga Per Jam", key: "price_per_hour", type: "number" },
                { label: "Rating (0-5)", key: "rating", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Olahraga</label>
                <select
                  value={form.sport_type}
                  onChange={(e) => setForm((p) => ({ ...p, sport_type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                >
                  <option value="">Pilih...</option>
                  {["futsal", "badminton", "basketball", "padel", "tenis"].map((s) => (
                    <option key={s} value={s.toLowerCase()}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipe</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Parkir, Toilet, Kantin"
                  value={form.facilities}
                  onChange={(e) => setForm((p) => ({ ...p, facilities: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Gambar Lapangan</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700">
                    <ImageIcon size={16} />
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, WEBP. Maks 2MB.
                  </span>
                </div>

                {imagePreview ? (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview gambar lapangan"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="mt-3 w-full h-40 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    Belum ada gambar
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="accent-[#4a7c59]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
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
