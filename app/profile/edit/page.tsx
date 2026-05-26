"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Save } from "lucide-react";
import api from "@/library/axios";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/masuk");
      return;
    }

    api.get("/profile")
      .then((res) => {
        const user = res.data.user;
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/masuk");
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.put("/profile", { name, email, phone });
      setSuccess("Profil berhasil diperbarui!");
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError(err.response?.data?.message ?? "Gagal memperbarui profil.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm font-semibold text-gray-700">Update informasi personal Anda</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Foto Profile */}
            <div>
              <p className="text-sm text-gray-700 mb-3">Foto Profile</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {photo ? (
                    <img src={photo} alt="foto profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Upload Foto
                  </button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG maksimal 2MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nomor Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            <hr className="border-gray-200" />

            {/* Buttons */}
            <div className="flex gap-3">
              <Link
                href="/profile"
                className="flex-1 text-center border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
              >
                <Save size={15} />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}