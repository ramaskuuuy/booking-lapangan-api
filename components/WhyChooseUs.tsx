import { Clock, CheckCircle, MapPin, Shield } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Booking Cepat",
    description: "Proses booking yang mudah dan cepat hanya dalam hitungan menit",
  },
  {
    icon: CheckCircle,
    title: "Konfirmasi Otomatis",
    description: "Dapatkan konfirmasi booking secara otomatis dan real-time",
  },
  {
    icon: MapPin,
    title: "Banyak Lokasi",
    description: "Pilihan lapangan di berbagai lokasi strategis",
  },
  {
    icon: Shield,
    title: "Aman & Terpercaya",
    description: "Sistem pembayaran yang aman dan terpercaya",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Kenapa Pilih Kami?
        </h2>
        <p className="text-gray-600 font-medium mb-12 text-lg">
          Platform booking lapangan terpercaya dengan berbagai keunggulan
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center px-6"
              >
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4">
                  <Icon size={28} className="text-gray-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
