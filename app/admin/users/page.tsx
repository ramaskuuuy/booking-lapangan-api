"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" }, cache: "no-store" });

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch(`${API_BASE}/users`).then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Users</h1>
      <p className="text-gray-500 text-sm mb-6">Daftar semua pengguna terdaftar</p>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4a7c59]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["ID","Nama","Email","No. HP","Bergabung"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={5} className="py-3 px-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">Belum ada user</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-400 text-xs">{u.id}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4 text-gray-500">{u.phone ?? "-"}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
