"use client";

import { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCourts, getImageUrl, parseFacilities, type Court } from "@/library/api";

const sportIconMap: Record<string, string> = {
  Padel: "🏓", Futsal: "⚽", Basketball: "🏀", Badminton: "🏸", Tenis: "🎾",
};

const filterTabs = ["Semua", "Futsal", "Badminton", "Padel", "Basketball"];

function VenueCard({ court }: { court: Court }) {
  return (
    <Link href={`/lapangan/${court.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <img
            src={getImageUrl(court.image)}
            alt={court.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-3 left-3 bg-white text-xs font-semibold px-3 py-1 rounded-full text-gray-700 shadow-sm">
            {court.type || "Venue"}
          </span>
        </div>
        <div className="pt-3 pb-4 px-1">
          <div className="flex items-center gap-1 mb-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">
              {Number(court.rating) > 0 ? Number(court.rating).toFixed(1) : "Baru"}
            </span>
            <span className="text-sm text-gray-400">| {court.location || court.sport_type}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">{court.name}</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{sportIconMap[court.sport_type] || "🏅"}</span>
            <span className="text-sm text-gray-500">{court.sport_type}</span>
          </div>
          <p className="text-sm text-gray-500">
            Mulai{" "}
            <span className="font-bold text-gray-900">
              dari Rp {Number(court.price_per_hour).toLocaleString("id-ID")}
            </span>{" "}
            <span className="text-gray-400">/sesi</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function LapanganPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const data = await getCourts({
          search: search || undefined,
          sport: activeTab !== "Semua" ? activeTab : undefined,
        });
        setCourts(data.data);
      } catch (err) {
        setError("Gagal memuat data lapangan. Pastikan server Laravel berjalan.");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCourts, 300);
    return () => clearTimeout(debounce);
  }, [search, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900">Semua Lapangan</h1>
          <p className="text-gray-500 mt-1">Temukan lapangan terbaik untuk permainan Anda</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-[#6b9e77] px-6 py-5">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 border-0"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                  activeTab === tab ? "bg-[#3a6347] text-white" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => setActiveTab(activeTab)} className="mt-4 text-sm text-[#4a7c59] hover:underline">
              Coba lagi
            </button>
          </div>
        ) : courts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Lapangan tidak ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci atau filter lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court) => (
              <VenueCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
