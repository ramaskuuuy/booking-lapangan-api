"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi kirim email → redirect ke halaman reset password
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Navbar />

      <div className="text-center mb-6 max-w-sm pt-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Lupa Password
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password
        </p>
      </div>

      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">
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

          <button
            type="submit"
            className="w-full bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            Kirim Link Reset Password
          </button>

          <p className="text-center text-sm text-gray-500">
            ←{" "}
            <Link href="/masuk" className="hover:text-[#4a7c59] transition-colors">
              Kembali ke Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
