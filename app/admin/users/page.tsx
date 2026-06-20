"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  Save,
  Loader2,
  RefreshCcw,
  Trash2,
  AlertTriangle,
  X,
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

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteModalProps {
  user: AppUser;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteModal({ user, onConfirm, onCancel, loading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            Hapus User?
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Kamu akan menghapus akun{" "}
            <span className="font-bold text-gray-800">{user.name}</span>{" "}
            ({user.email}). Tindakan ini tidak dapat dibatalkan dan semua data
            terkait akan dihapus permanen.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setSuccess("");

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

      setSuccess(`Role ${user.name} berhasil diperbarui.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui role.");
      fetchUsers();
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const res = await authFetch(
        `${API_BASE}/admin/users/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setSuccess(`User "${deleteTarget.name}" berhasil dihapus.`);
      setTimeout(() => setSuccess(""), 3500);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
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

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {[
              { label: "Total User", value: stats.total },
              { label: "Administrator", value: stats.admin },
              { label: "Pemilik Lapangan", value: stats.owner },
              { label: "User Biasa", value: stats.user },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {loading ? (
                    <span className="inline-block h-8 w-10 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Notifications */}
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ✓ {success}
            </div>
          )}

          {/* Table Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Daftar User
                </h2>
                <p className="text-sm text-slate-500">
                  Ubah role atau hapus user langsung dari sini
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-[360px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, email, nomor hp, role..."
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

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
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          Belum ada user.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 transition"
                        >
                          {/* ID */}
                          <td className="px-4 py-4 text-slate-500">{user.id}</td>

                          {/* Nama */}
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                                {user.role === "administrator" ? (
                                  <ShieldCheck className="h-4 w-4" />
                                ) : (
                                  <Users className="h-4 w-4" />
                                )}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4 text-slate-600">
                            {user.email}
                          </td>

                          {/* No. HP */}
                          <td className="px-4 py-4 text-slate-600">
                            {user.phone ?? "-"}
                          </td>

                          {/* Role Dropdown */}
                          <td className="px-4 py-4">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  e.target.value as AppUser["role"]
                                )
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

                          {/* Bergabung */}
                          <td className="px-4 py-4 text-slate-600">
                            {formatDate(user.created_at)}
                          </td>

                          {/* Aksi */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {/* Save Role */}
                              <button
                                onClick={() => handleSaveRole(user)}
                                disabled={savingId === user.id}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                              >
                                {savingId === user.id ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span className="hidden sm:inline">Menyimpan...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Simpan</span>
                                  </>
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteTarget(user)}
                                disabled={savingId === user.id || deleting}
                                title="Hapus user"
                                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:border-red-300 disabled:opacity-40 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer count */}
            {!loading && (
              <p className="mt-4 text-xs text-slate-400 text-right">
                Menampilkan {filteredUsers.length} dari {users.length} user
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}