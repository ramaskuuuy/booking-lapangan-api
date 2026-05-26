"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Calendar, User, Pencil } from "lucide-react";
import api from "@/library/axios";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/masuk");
    return;
  }

  api.get("/profile")
    .then((res) => setUser(res.data.user)) // ← ambil res.data.user
    .catch(() => {
      localStorage.removeItem("token");
      router.push("/masuk");
    })
    .finally(() => setLoading(false));
}, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (_) {}
    localStorage.removeItem("token");
    router.push("/masuk");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header Profil */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">
                Member sejak {formatDate(user.created_at)}
              </p>
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-700 hover:border-[#4a7c59] hover:text-[#4a7c59] transition"
          >
            <Pencil size={14} />
            Edit Profile
          </Link>
        </div>

        {/* Informasi Personal */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Informasi Personal
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Nomor Telepon</p>
                <p className="font-medium">{user.phone ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Bergabung</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/lapangan"
              className="text-center bg-[#4a7c59] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#3a6347] transition"
            >
              Booking Lapangan
            </Link>
            <Link
              href="/bookings"
              className="text-center border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:border-[#4a7c59] hover:text-[#4a7c59] transition"
            >
              Riwayat Booking
            </Link>
            <Link
              href="/profile/edit"
              className="text-center border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:border-[#4a7c59] hover:text-[#4a7c59] transition"
            >
              Pengaturan
            </Link>
            <button
              onClick={handleLogout}
              className="text-center border border-red-200 text-red-500 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}