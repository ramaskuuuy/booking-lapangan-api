"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar() {
  const [namaLapangan, setNamaLapangan] = useState("");
  const [kota, setKota] = useState("");
  const [olahraga, setOlahraga] = useState("");

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Cari nama lapangan */}
          <input
            type="text"
            placeholder="Cari nama lapangan"
            value={namaLapangan}
            onChange={(e) => setNamaLapangan(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition"
          />

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200" />

          {/* Pilih Kota */}
          <select
            value={kota}
            onChange={(e) => setKota(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition appearance-none bg-white"
          >
            <option value="">Pilih Kota</option>
            <option value="jakarta">Jakarta</option>
            <option value="surabaya">Surabaya</option>
            <option value="bandung">Bandung</option>
            <option value="yogyakarta">Yogyakarta</option>
            <option value="cilacap">Cilacap</option>
          </select>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200" />

          {/* Pilih cabang olahraga */}
          <select
            value={olahraga}
            onChange={(e) => setOlahraga(e.target.value)}
            className="flex-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] transition appearance-none bg-white"
          >
            <option value="">Pilih cabang olahraga</option>
            <option value="futsal">Futsal</option>
            <option value="badminton">Badminton</option>
            <option value="basketball">Basketball</option>
            <option value="padel">Padel</option>
            <option value="tenis">Tenis</option>
          </select>

          {/* Filter button */}
          <button className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
            <SlidersHorizontal size={20} />
          </button>

          {/* Search button */}
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#41674A] text-white font-semibold rounded-xl hover:bg-[#3a6347] transition-colors whitespace-nowrap">
            <Search size={18} />
            Cari
          </button>
        </div>
      </div>
    </div>
  );
}
