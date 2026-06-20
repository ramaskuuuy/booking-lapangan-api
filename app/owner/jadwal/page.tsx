"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const authFetch = (url: string, opts?: RequestInit) =>
  fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts?.headers ?? {}),
    },
  });

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type HourData = {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export default function JadwalOperasional() {
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>("");
  const [hours, setHours] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Ambil daftar lapangan milik owner
    authFetch(`${API_BASE}/courts?per_page=100`)
      .then((res) => res.json())
      .then((data) => {
        const courtList = data.data ?? [];
        setCourts(courtList);
        if (courtList.length > 0) {
          setSelectedCourt(String(courtList[0].id));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourt) return;
    setLoading(true);
    authFetch(`${API_BASE}/owner/courts/${selectedCourt}/operational-hours`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal mengambil jadwal");
        return res.json();
      })
      .then((data: HourData[]) => {
        const safeData = Array.isArray(data) ? data : [];
        // Initialize 7 days if empty or partial
        const initial = DAYS.map((_, index) => {
          const existing = safeData.find((d) => d.day_of_week === index);
          return existing
            ? { ...existing, open_time: existing.open_time?.slice(0, 5) ?? "08:00", close_time: existing.close_time?.slice(0, 5) ?? "22:00" }
            : { day_of_week: index, open_time: "08:00", close_time: "22:00", is_closed: false };
        });
        setHours(initial);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat jadwal operasional");
        setHours([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCourt]);

  const handleChange = (day: number, field: keyof HourData, value: any) => {
    setHours((prev) => prev.map((h) => (h.day_of_week === day ? { ...h, [field]: value } : h)));
  };

  const handleSave = async () => {
    if (!selectedCourt) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/owner/courts/${selectedCourt}/operational-hours`, {
        method: "PUT",
        body: JSON.stringify({ hours }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan jadwal.");
      setSuccess("Jadwal operasional berhasil diperbarui!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  if (loading && !selectedCourt) {
    return <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-[#4a7c59]" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Jadwal Operasional</h1>
          <p className="text-gray-500 text-sm mt-1">Atur jam buka dan tutup untuk lapangan Anda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedCourt}
          className="flex items-center gap-2 bg-[#4a7c59] hover:bg-[#3a6347] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Simpan Jadwal
        </button>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">✓ {success}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Lapangan</label>
        <select
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59]"
        >
          {courts.length === 0 && <option value="">Tidak ada lapangan</option>}
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourt && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
            ) : (
              <div className="space-y-4">
                {hours.map((h) => (
                  <div key={h.day_of_week} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="w-32 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!h.is_closed}
                        onChange={(e) => handleChange(h.day_of_week, "is_closed", !e.target.checked)}
                        className="accent-[#4a7c59] w-4 h-4 cursor-pointer"
                        id={`day-${h.day_of_week}`}
                      />
                      <label htmlFor={`day-${h.day_of_week}`} className={`font-semibold cursor-pointer ${h.is_closed ? "text-gray-400" : "text-gray-900"}`}>
                        {DAYS[h.day_of_week]}
                      </label>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="time"
                        value={h.open_time}
                        onChange={(e) => handleChange(h.day_of_week, "open_time", e.target.value)}
                        disabled={h.is_closed}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      <span className="text-gray-400 text-sm">sampai</span>
                      <input
                        type="time"
                        value={h.close_time}
                        onChange={(e) => handleChange(h.day_of_week, "close_time", e.target.value)}
                        disabled={h.is_closed}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#4a7c59] disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                    {h.is_closed && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Tutup</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
