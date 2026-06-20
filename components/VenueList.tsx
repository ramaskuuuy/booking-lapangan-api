"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCourts, getImageUrl, type Court } from "@/library/api";

type Filters = {
  namaLapangan: string;
  kota: string;
  customKota: string;
  olahraga: string;
};

const sportIconMap: Record<string, string> = {
  Padel: "🏓",
  Futsal: "⚽",
  Basketball: "🏀",
  Badminton: "🏸",
  Tenis: "🎾",
};

function VenueCard({ court }: { court: Court }) {
  return (
    <Link href={`/lapangan/${court.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="relative h-52 w-full overflow-hidden rounded-2xl">
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
            <span className="text-sm text-gray-400">
              | {court.location || court.sport_type}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-lg mb-2">{court.name}</h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{sportIconMap[court.sport_type] || "🏅"}</span>
            <span className="text-sm text-gray-500">{court.sport_type}</span>
            {court.owner && (
              <>
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-xs font-semibold text-[#4a7c59]">
                  {court.owner.name}
                </span>
              </>
            )}
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

export default function VenueList({ filters }: { filters: Filters }) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourts()
      .then((res) => setCourts(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCourts = useMemo(() => {
    const keyword = filters.namaLapangan.trim().toLowerCase();

    const kotaFilter =
      filters.kota === "other"
        ? filters.customKota.trim().toLowerCase()
        : filters.kota.trim().toLowerCase();

    return courts.filter((court) => {
      const nameMatch = keyword
        ? court.name?.toLowerCase().includes(keyword)
        : true;

      const cityMatch = kotaFilter
        ? (court.location ?? "").toLowerCase().includes(kotaFilter)
        : true;

      const sportMatch = filters.olahraga
        ? (court.sport_type ?? "").toLowerCase() === filters.olahraga.toLowerCase()
        : true;

      return nameMatch && cityMatch && sportMatch;
    });
  }, [courts, filters]);

  const visibleCourts = filteredCourts.slice(0, 6);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8">
      {visibleCourts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Tidak ada lapangan yang sesuai filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCourts.map((court) => (
            <VenueCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </section>
  );
}