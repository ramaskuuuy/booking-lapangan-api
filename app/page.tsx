import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import VenueList from "@/components/VenueList";
import WhyChooseUs from "@/components/WhyChooseUs";
import { CTABanner, Footer } from "@/components/CTAAndFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Push content below fixed navbar */}
      <div className="pt-16">
        <HeroSection />
        <SearchBar />
        <VenueList />
        <WhyChooseUs />
        <CTABanner />
        <Footer />
      </div>
    </main>
  );
}
