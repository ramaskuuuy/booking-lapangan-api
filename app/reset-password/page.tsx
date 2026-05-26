"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordBaru.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (passwordBaru !== konfirmasi) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    // TODO: connect to API
    setSukses(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Navbar />

      <div className="text-center mb-6 pt-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Reset Password
        </h1>
        <p className="text-gray-500 text-sm">Masukkan password baru Anda</p>
      </div>

      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
        {sukses ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-[#4a7c59]" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Password Berhasil Direset!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Silakan login dengan password baru Anda.
            </p>
            <Link
              href="/masuk"
              className="inline-block bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-2.5 px-8 rounded-xl transition-colors"
            >
              Login Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Password Baru */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="text-gray-500" />
                Password Baru
              </label>
              <input
                type="password"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock size={16} className="text-gray-500" />
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={konfirmasi}
                onChange={(e) => setKonfirmasi(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Password requirements */}
            <div className="bg-[#4a7c59] text-white text-sm rounded-xl px-4 py-3">
              <p className="font-semibold mb-1.5">Password harus:</p>
              <ul className="list-disc list-inside space-y-0.5 text-green-100 text-xs">
                <li>Minimal 8 karakter</li>
                <li>Mengandung huruf dan angka</li>
                <li>Kombinasi huruf besar dan kecil (disarankan)</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-3 rounded-xl transition-colors duration-200"
            >
              Reset Password
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/masuk" className="hover:text-[#4a7c59] transition-colors">
                Kembali ke Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
