"use client";

import Navbar from "@/components/Navbar";
import { Calendar, CreditCard, Tag, Bell, Info, Check } from "lucide-react";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface NotifData {
  type?: string;
  title?: string;
  message?: string;
  amount?: number;
  court_name?: string;
  promo_code?: string;
  booking_time?: string;
  invoice?: string;
  booking_id?: number;
  payment_id?: number;
}

interface Notification {
  id: string;
  type: string;
  data: NotifData;
  read_at: string | null;
  created_at: string;
}

function getNotifStyle(notif: Notification) {
  const type = notif.data?.type ?? notif.type ?? "";

  if (type.includes("payment") || type.includes("Payment")) {
    return { icon: CreditCard, label: "Payment Success" };
  }
  if (type.includes("booking") || type.includes("Booking")) {
    return { icon: Calendar, label: "Booking Confirmed" };
  }
  if (type.includes("promo") || type.includes("Promo")) {
    return { icon: Tag, label: "New Promo Available!" };
  }
  if (type.includes("reminder") || type.includes("Reminder")) {
    return { icon: Bell, label: "Booking Reminder" };
  }
  return { icon: Info, label: "System Notification" };
}

function getTitle(notif: Notification): string {
  if (notif.data?.title) return notif.data.title;
  return getNotifStyle(notif).label;
}

function getMessage(notif: Notification): string {
  // Pakai field message langsung dari database
  if (notif.data?.message) return notif.data.message;
  return "-";
}

function formatWaktu(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const tanggal = d.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  return `${tanggal} pukul ${jam}`;
}

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchNotifs = async () => {
    const token = getToken();
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error();
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : raw.data ?? [];
      // Parse field data jika masih string JSON
      const parsed: Notification[] = list.map((n: any) => ({
        ...n,
        data: typeof n.data === "string" ? JSON.parse(n.data) : n.data ?? {},
      }));
      setNotifs(parsed);
    } catch {
      setError("Gagal memuat notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const unreadCount = notifs.filter((n) => !n.read_at).length;

  const handleTandaiSemua = async () => {
    const token = getToken();
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const handleTandaiSatu = async (id: string) => {
    const token = getToken();
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    setNotifs((prev) =>
      prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Notifikasi</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0
                ? `Anda memiliki ${unreadCount} notifikasi baru`
                : "Semua notifikasi sudah dibaca"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleTandaiSemua}
              className="text-sm text-gray-600 hover:text-[#4a7c59] transition-colors font-medium"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">{error}</p>
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifs.map((notif) => {
              const { icon: Icon } = getNotifStyle(notif);
              const isUnread = !notif.read_at;
              return (
                <div
                  key={notif.id}
                  className={`border rounded-2xl p-5 transition-all ${
                    isUnread ? "border-gray-300" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className={`text-sm mb-1 ${isUnread ? "font-extrabold text-gray-900" : "font-bold text-gray-900"}`}>
                          {getTitle(notif)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">{getMessage(notif)}</p>
                        {/* Tampilkan invoice kalau ada */}
                        {notif.data?.invoice && (
                          <p className="text-xs text-gray-400 mb-1">Invoice: {notif.data.invoice}</p>
                        )}
                        <p className="text-xs text-gray-400">{formatWaktu(notif.created_at)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTandaiSatu(notif.id)}
                      title={isUnread ? "Tandai sudah dibaca" : "Sudah dibaca"}
                      className={`shrink-0 mt-1 transition-colors ${
                        isUnread ? "text-gray-300 hover:text-[#4a7c59]" : "text-gray-400"
                      }`}
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
