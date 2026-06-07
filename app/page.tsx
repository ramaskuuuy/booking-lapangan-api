"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import VenueList from "@/components/VenueList";
import WhyChooseUs from "@/components/WhyChooseUs";
import { CTABanner, Footer } from "@/components/CTAAndFooter";

type Filters = {
  namaLapangan: string;
  kota: string;
  customKota: string;
  olahraga: string;
};

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({
    namaLapangan: "",
    kota: "",
    customKota: "",
    olahraga: "",
  });

  const [activeFilters, setActiveFilters] = useState<Filters>({
    namaLapangan: "",
    kota: "",
    customKota: "",
    olahraga: "",
  });

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <HeroSection />
        <SearchBar
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
        />
        <VenueList filters={activeFilters} />
        <WhyChooseUs />
        <CTABanner />
        <Footer />
      </div>
    </main>
  );
}