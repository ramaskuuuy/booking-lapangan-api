"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function AdminActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/activity-logs`, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: "application/json" },
    }).then(r => r.json())
      .then(data => setLogs(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Activity Log</h1>
      <p className="text-gray-500 text-sm mb-6">Log semua aktivitas di sistem</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada activity log</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#4a7c59] mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{log.description ?? log.event ?? "-"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.causer?.name ?? "System"} · {new Date(log.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
