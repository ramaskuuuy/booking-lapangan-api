"use client";

import { useState } from "react";
import { Send, Users, User } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function AdminNotifikasi() {
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!title || !message) { setError("Judul dan pesan wajib diisi."); return; }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: target === "specific" ? Number(userId) : null,
          title,
          message,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Notifikasi berhasil dikirim!");
      setTitle("");
      setMessage("");
      setUserId("");
    } catch {
      setError("Gagal mengirim notifikasi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Kirim Notifikasi</h1>
      <p className="text-gray-500 text-sm mb-8">Kirim notifikasi manual ke user</p>

      <div className="max-w-xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Target */}
        <div className="mb-5">
          <label className="text-sm font-bold text-gray-700 mb-3 block">Kirim ke</label>
          <div className="flex gap-3">
            <button onClick={() => setTarget("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${target === "all" ? "bg-[#4a7c59] text-white border-[#4a7c59]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <Users size={16} /> Semua User
            </button>
            <button onClick={() => setTarget("specific")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${target === "specific" ? "bg-[#4a7c59] text-white border-[#4a7c59]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <User size={16} /> User Tertentu
            </button>
          </div>
        </div>

        {target === "specific" && (
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 mb-1 block">User ID</label>
            <input type="number" placeholder="Masukkan ID user..." value={userId} onChange={e => setUserId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]" />
          </div>
        )}

        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Judul Notifikasi</label>
          <input type="text" placeholder="Contoh: Promo Spesial!" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]" />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pesan</label>
          <textarea rows={4} placeholder="Tulis pesan notifikasi..." value={message} onChange={e => setMessage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] resize-none" />
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-4">{success}</p>}

        <button onClick={handleSend} disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
          <Send size={18} />
          {sending ? "Mengirim..." : "Kirim Notifikasi"}
        </button>
      </div>
    </div>
  );
}
