"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  CreditCard,
  Tag,
  LogOut,
  Bell,
  Clock,
  TrendingUp,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const activeMenuItems = [
  { label: "Dashboard",    href: "/owner",           icon: LayoutDashboard },
  { label: "Lapangan",     href: "/owner/lapangan",  icon: MapPin },
  { label: "Booking",      href: "/owner/bookings",  icon: CalendarDays },
  { label: "Promosi",      href: "/owner/promo",     icon: Tag },
  { label: "Jadwal Operasional", href: "/owner/jadwal", icon: Clock },
  { label: "Laporan Pendapatan", href: "/owner/laporan/pendapatan", icon: TrendingUp },
  { label: "Laporan Transaksi",  href: "/owner/laporan/transaksi", icon: FileText },
  { label: "Ulasan Pelanggan",   href: "/owner/ulasan",            icon: MessageSquare },
];

const disabledMenuItems: any[] = [];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [ownerName, setOwnerName] = useState("Owner");
  const [checking, setChecking]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/masuk?redirect=/owner");
      return;
    }

    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const user  = data.user ?? data;
        const roles: string[] = data.roles ?? user.roles ?? [];
        const isOwner = roles.includes("pemilik_lapangan");

        if (!isOwner) {
          router.push("/");
          return;
        }

        setOwnerName(user.name ?? "Owner");
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/masuk?redirect=/owner");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/masuk");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/owner" className="flex flex-col items-start">
            <img src="/foto/logo.png" alt="logo" className="h-10 object-contain" />
            <span className="text-xs font-bold text-[#4a7c59] mt-1 tracking-wide">
              Owner Mode
            </span>
          </Link>
        </div>

        {/* Menu Aktif */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
          <nav className="space-y-1">
            {activeMenuItems.map((item) => {
              const Icon     = item.icon;
              const isActive = pathname === item.href || (item.href !== "/owner" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#4a7c59] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Menu Disabled (Segera Hadir) */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mt-6 mb-3">
            Segera Hadir
          </p>
          <nav className="space-y-1">
            {disabledMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  title="Fitur ini belum tersedia"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-semibold">
                    Soon
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: back to main site */}
        <div className="px-3 py-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" />
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-end gap-4 sticky top-0 z-30">
          <button className="p-2 text-gray-400 hover:text-[#4a7c59] transition-colors">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4a7c59] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{ownerName}</p>
              <p className="text-xs text-gray-400">Pemilik Lapangan</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
