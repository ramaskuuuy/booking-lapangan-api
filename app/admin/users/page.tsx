"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  UserCog,
  Save,
  Loader2,
  RefreshCcw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
      ...(opts?.headers ?? {}),
    },
  });

type AppUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "administrator" | "pemilik_lapangan" | "user";
  created_at: string | null;
};

const ROLE_OPTIONS = [
  { value: "administrator", label: "Administrator" },
  { value: "pemilik_lapangan", label: "Pemilik Lapangan" },
  { value: "user", label: "User Biasa" },
] as const;

function formatDate(raw: string | null) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/admin/users`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat data user.");
      }

      const list = Array.isArray(data) ? data : data.data ?? [];
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data user.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === "administrator").length,
      owner: users.filter((u) => u.role === "pemilik_lapangan").length,
      user: users.filter((u) => u.role === "user").length,
    };
  }, [users]);

  const handleRoleChange = (id: number, role: AppUser["role"]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  const handleSaveRole = async (user: AppUser) => {
    setSavingId(user.id);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: user.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui role.");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                role: data.user?.role ?? user.role,
              }
            : u
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui role.");
      fetchUsers();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Users</h1>
            <p className="text-slate-500 mt-1">
              Kelola role user agar akses otomatis sesuai login
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total User</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Administrator</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.admin}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pemilik Lapangan</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.owner}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">User Biasa</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {stats.user}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Daftar User</h2>
              <p className="text-sm text-slate-500">
                Ubah role user langsung dari sini
              </p>
            </div>

            <div className="relative w-full md:w-[360px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                  type="text"
                  placeholder="      Cari nama, email, nomor hp, role..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray text-gray-500 placeholder:text-gray-200"
                />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">ID</th>
                    <th className="px-4 py-3 font-bold">Nama</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">No. HP</th>
                    <th className="px-4 py-3 font-bold">Role</th>
                    <th className="px-4 py-3 font-bold">Bergabung</th>
                    <th className="px-4 py-3 font-bold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-5 rounded bg-slate-100 animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        Belum ada user.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-4 text-slate-500">{user.id}</td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                              {user.role === "administrator" ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <Users className="h-4 w-4" />
                              )}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{user.email}</td>
                        <td className="px-4 py-4 text-slate-600">{user.phone ?? "-"}</td>
                        <td className="px-4 py-4">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as AppUser["role"])
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none text-gray-900 focus:border-emerald-500"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleSaveRole(user)}
                            disabled={savingId === user.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {savingId === user.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Simpan
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}