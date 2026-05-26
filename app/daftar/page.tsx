"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(nama, email,phone, password, passwordConfirm);
      router.push("/masuk");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Gagal mendaftar, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Buat Akun Baru
        </h1>
        <p className="text-gray-500 text-sm">
          Daftar untuk mulai booking lapangan
        </p>
      </div>

      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="text-gray-500" />
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="text-gray-500" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
            />
          </div>
          
          <div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
    <Phone size={16} className="text-gray-500" />
    Nomor Telepon
  </label>
  <input
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    required
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
  />
</div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Lock size={16} className="text-gray-500" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
            />
          </div>

          <div>
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
    <Lock size={16} className="text-gray-500" />
    Konfirmasi Password
  </label>
  <input
    type="password"
    value={passwordConfirm}
    onChange={(e) => setPasswordConfirm(e.target.value)}
    required
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
  />
</div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="setuju"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              required
              className="mt-0.5 w-4 h-4 accent-[#4a7c59] cursor-pointer"
            />
            <label htmlFor="setuju" className="text-sm text-gray-600 leading-relaxed">
              Saya setuju dengan{" "}
              <Link href="/syarat" className="font-bold text-gray-800 hover:underline">
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link href="/privasi" className="font-bold text-gray-800 hover:underline">
                Kebijakan Privasi
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-[#4a7c59] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}