"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, MapPin, CalendarDays, CreditCard,
  Tag, Users, Activity, Settings, HelpCircle, Bell, ChevronDown, LogOut
} from "lucide-react";

const menuItems = [
  { label: "Dashboard",        href: "/admin",              icon: LayoutDashboard },
  { label: "Manage Fields",    href: "/admin/lapangan",     icon: MapPin },
  { label: "Manage Bookings",  href: "/admin/bookings",     icon: CalendarDays },
  { label: "Payment History",  href: "/admin/payments",     icon: CreditCard },
  { label: "Manage Promo",     href: "/admin/promo",        icon: Tag },
  { label: "User",             href: "/admin/users",        icon: Users },
];

const generalItems = [
  { label: "Activity Log",  href: "/admin/activity-log", icon: Activity },
  { label: "Settings",      href: "/admin/settings",     icon: Settings },
  { label: "Help Desk",     href: "/admin/help",         icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Tidak ada token → langsung ke login
    if (!token) {
      router.push("/masuk?redirect=/admin");
      return;
    }

    // Cek role dari API /profile
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
  console.log("PROFILE DATA:", JSON.stringify(data));
  const user = data.user ?? data;
  const roles: string[] = data.roles ?? user.roles ?? [];
  console.log("ROLES:", roles);
  
  const isAdmin = roles.includes("administrator") || roles.includes("admin");
  console.log("IS ADMIN:", isAdmin);

  if (!isAdmin) {
    router.push("/");
    return;
  }

  setAdminName(user.name ?? "Admin");
  setChecking(false);
})
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/masuk?redirect=/admin");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/masuk");
  };

  // Tampilkan loading saat mengecek auth
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
          <Link href="/admin" className="flex flex-col items-start">
            <img src="/foto/logo.png" alt="logo" className="h-10 object-contain" />
            <span className="text-xs font-bold text-[#4a7c59] mt-1 tracking-wide">Admin Mode</span>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-[#4a7c59] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mt-6 mb-3">General</p>
          <nav className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-[#4a7c59] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
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
              {adminName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <button onClick={handleLogout} className="ml-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
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
