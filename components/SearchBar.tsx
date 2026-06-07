"use client";

import { Dispatch, SetStateAction } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

type Filters = {
  namaLapangan: string;
  kota: string;
  customKota: string;
  olahraga: string;
};

type Props = {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  onSearch: () => void;
};

export default function SearchBar({ filters, setFilters, onSearch }: Props) {
  const showCustomCity = filters.kota === "other";

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama lapangan"
            value={filters.namaLapangan}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, namaLapangan: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            className="flex-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
          />

          <div className="hidden md:block w-px h-8 bg-gray-200" />

          <div className="flex-1 w-full">
            <select
              value={filters.kota}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  kota: e.target.value,
                  customKota: e.target.value === "other" ? prev.customKota : "",
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition appearance-none bg-white"
            >
              <option value="">Pilih Kota</option>
              <option value="jakarta">Jakarta</option>
              <option value="surabaya">Surabaya</option>
              <option value="bandung">Bandung</option>
              <option value="yogyakarta">Yogyakarta</option>
              <option value="cilacap">Cilacap</option>
              <option value="other">Other</option>
            </select>

            {showCustomCity && (
              <input
                type="text"
                placeholder="Masukkan kota lain"
                value={filters.customKota}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, customKota: e.target.value }))
                }
                className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
              />
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-gray-200" />

          <select
            value={filters.olahraga}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, olahraga: e.target.value }))
            }
            className="flex-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition appearance-none bg-white"
          >
            <option value="">Pilih cabang olahraga</option>
            <option value="futsal">Futsal</option>
            <option value="badminton">Badminton</option>
            <option value="basketball">Basketball</option>
            <option value="padel">Padel</option>
            <option value="tenis">Tenis</option>
          </select>

          <button
            type="button"
            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-500"
          >
            <SlidersHorizontal size={20} />
          </button>

          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#41674A] text-white font-semibold rounded-xl hover:bg-[#3a6347] transition-colors whitespace-nowrap"
          >
            <Search size={18} />
            Cari
          </button>
        </div>
      </div>
    </div>
  );
}