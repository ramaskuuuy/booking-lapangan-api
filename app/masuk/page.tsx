"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/services/auth";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const data = await login(email, password);
    
    // Cek role setelah login
   const roles: string[] = data.roles ?? [];

const isAdmin =
  roles.includes("administrator") ||
  roles.includes("admin");

const isOwner =
  roles.includes("pemilik_lapangan");

if (isAdmin) {
  router.push("/admin");
} else if (isOwner) {
  router.push("/owner");
} else {
  router.push(redirectTo);
}
  } catch (err: any) {
    setError(err.response?.data?.message ?? "Email atau password salah");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Navbar />

      <div className="text-center mb-6 pt-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Selamat Datang Kembali
        </h1>
        <p className="text-gray-500 text-sm">
          Masuk ke akun anda untuk melanjutkan
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

          <div className="text-right">
            <Link href="/lupa-password" className="text-sm text-gray-500 hover:text-[#4a7c59] transition-colors">
              Lupa Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link href={`/daftar${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-[#4a7c59] font-semibold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </form>
      </div>

      <Link href="/" className="mt-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
        ← Kembali ke beranda
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}