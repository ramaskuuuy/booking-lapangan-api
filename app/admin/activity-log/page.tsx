"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  Clock,
  Calendar,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// ─── Types ────────────────────────────────────────────────────────────────────

type LogEntry = {
  id: number;
  user_id: number | null;
  event: "login" | "logout" | "register" | string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  } | null;
};

type Meta = {
  current_page: number;
  last_page: number;
  total: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_META: Record<
  string,
  { action: string; changes: string; status: "Success" | "Created" | "Error" }
> = {
  login: { action: "Login", changes: "User Logged In", status: "Success" },
  logout: { action: "Logout", changes: "User Logged Out", status: "Success" },
  register: {
    action: "Register",
    changes: "Account Created",
    status: "Created",
  },
};

const STATUS_STYLE: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Created: "bg-sky-100 text-sky-700",
  Error: "bg-red-100 text-red-600",
};

const ROLE_LABEL: Record<string, string> = {
  administrator: "Admin",
  pemilik_lapangan: "Owner",
  user: "User",
};

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function fmtDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [timeFilter, setTimeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLogs = (p = 1) => {
    setLoading(true);
    fetch(`${API_BASE}/admin/activity-logs?page=${p}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        const items: LogEntry[] = Array.isArray(data) ? data : (data.data ?? []);
        setLogs(items);
        setMeta({
          current_page: data.meta?.current_page ?? data.current_page ?? 1,
          last_page: data.meta?.last_page ?? data.last_page ?? 1,
          total: data.meta?.total ?? data.total ?? items.length,
        });
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Client-side filter ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const d = new Date(log.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

      if (dateFilter && dateStr !== dateFilter) return false;
      if (timeFilter && timeStr < timeFilter) return false;
      if (actionFilter !== "all" && log.event !== actionFilter) return false;
      if (roleFilter !== "all" && (log.user?.role ?? "user") !== roleFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        const name = log.user?.name?.toLowerCase() ?? "";
        const email = log.user?.email?.toLowerCase() ?? "";
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [logs, dateFilter, timeFilter, actionFilter, roleFilter, search]);

  const hasFilter =
    timeFilter || dateFilter || roleFilter !== "all" || actionFilter !== "all" || search;

  const resetFilters = () => {
    setTimeFilter("");
    setDateFilter("");
    setRoleFilter("all");
    setActionFilter("all");
    setSearch("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Activity Log
        </h1>
        <p className="text-gray-400 text-sm">
          Track and monitor all administrative actions, system updates, and user
          changes.
        </p>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-5 flex flex-wrap items-end gap-4">
        {/* TIME */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            TIME
          </label>
          <div className="relative">
            <input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 pr-9 w-36 focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/20"
            />
            <Clock
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* DATE */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            DATE
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 pr-9 w-44 focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/20"
            />
            <Calendar
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ROLE */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            ROLE
          </label>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 pr-9 w-36 bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/20"
            >
              <option value="all">All Role</option>
              <option value="administrator">Admin</option>
              <option value="pemilik_lapangan">Owner</option>
              <option value="user">User</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            ACTION
          </label>
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 pr-9 w-40 bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/20"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="register">Register</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest invisible">
            SEARCH
          </label>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search username / email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a3d]/20"
            />
          </div>
        </div>

        {/* Filter button */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest invisible">
            BTN
          </label>
          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-2 px-5 py-[9px] bg-[#2d5a3d] hover:bg-[#244d33] active:bg-[#1d3f2a] text-white rounded-xl text-sm font-semibold transition-all"
          >
            <SlidersHorizontal size={15} />
            Filter
          </button>
        </div>

        {/* Reset link */}
        {hasFilter && (
          <button
            onClick={resetFilters}
            className="self-end pb-[10px] text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Loading skeleton */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[60px] bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="py-24 text-center text-gray-400">
            <Activity size={44} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Belum ada activity log</p>
            {hasFilter && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-[#2d5a3d] underline"
              >
                Hapus filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Table head ──────────────────────────────────────────────── */}
            <div className="grid gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/70"
              style={{ gridTemplateColumns: "200px 1fr 100px 160px 1fr 110px" }}
            >
              {[
                "TIME & DATE",
                "NAME & ROLE",
                "ACTION",
                "TARGET",
                "CHANGES",
                "STATUS",
              ].map((h) => (
                <span
                  key={h}
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* ── Table rows ──────────────────────────────────────────────── */}
            <div className="divide-y divide-gray-50">
              {filtered.map((log) => {
                const ev = EVENT_META[log.event] ?? {
                  action: log.event,
                  changes: log.description,
                  status: "Success" as const,
                };
                const role = log.user?.role ?? "user";
                const roleLabel = ROLE_LABEL[role] ?? role;
                const userInitials = initials(log.user?.name);

                return (
                  <div
                    key={log.id}
                    className="grid gap-4 items-center px-6 py-4 hover:bg-gray-50/80 transition-colors"
                    style={{
                      gridTemplateColumns: "200px 1fr 100px 160px 1fr 110px",
                    }}
                  >
                    {/* TIME & DATE */}
                    <span className="text-sm text-gray-700 font-mono tabular-nums">
                      {fmtDatetime(log.created_at)}
                    </span>

                    {/* NAME & ROLE */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none">
                        {userInitials}
                      </div>
                      <span className="text-sm text-gray-800 font-medium truncate">
                        {log.user?.name ?? "System"}{" "}
                        <span className="text-gray-400 font-normal">
                          ({roleLabel})
                        </span>
                      </span>
                    </div>

                    {/* ACTION */}
                    <span className="text-sm text-gray-700">{ev.action}</span>

                    {/* TARGET — IP address */}
                    <span className="text-sm text-gray-500 font-mono truncate">
                      {log.ip_address ?? "—"}
                    </span>

                    {/* CHANGES — description */}
                    <span className="text-sm text-gray-600 truncate">
                      {log.description}
                    </span>

                    {/* STATUS */}
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[ev.status]}`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Total{" "}
                  <span className="font-semibold text-gray-600">
                    {meta.total}
                  </span>{" "}
                  log
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-gray-400 px-1">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.last_page, p + 1))
                    }
                    disabled={page === meta.last_page}
                    className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
