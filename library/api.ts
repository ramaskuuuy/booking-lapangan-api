const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface Court {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  sport_type: string;
  type: string;
  price_per_hour: number;
  facilities: string | string[];
  image: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCourts {
  current_page: number;
  data: Court[];
  total: number;
  last_page: number;
}

// Helper: parse facilities (bisa string JSON atau array)
export function parseFacilities(facilities: string | string[]): string[] {
  if (Array.isArray(facilities)) return facilities;
  try {
    const parsed = JSON.parse(facilities);
    return Array.isArray(parsed) ? parsed : [facilities];
  } catch {
    return facilities ? [facilities] : [];
  }
}

// Helper: get image URL
export function getImageUrl(image: string | null): string {
  if (!image) return "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=600&q=80";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000/storage/${image}`;
}

// GET /api/courts
export async function getCourts(params?: { search?: string; sport?: string; page?: number }): Promise<PaginatedCourts> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.sport) query.set("sport_type", params.sport);
  if (params?.page) query.set("page", String(params.page));

  const res = await fetch(`${API_BASE}/courts?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Gagal mengambil data lapangan");
  return res.json();
}

export interface Promotion {
  id: number;
  court_id: number | null;
  title: string;
  description: string | null;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  banner_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/promotions
export async function getPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE}/promotions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data promo");
  const data = await res.json();
  // Handle both paginated and plain array response
  return Array.isArray(data) ? data : data.data ?? [];
}

// Helper: format tanggal Indonesia
export function formatTanggalDB(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// GET /api/courts/:id
export async function getCourt(id: number): Promise<Court> {
  const res = await fetch(`${API_BASE}/courts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Lapangan tidak ditemukan");
  return res.json();
}
