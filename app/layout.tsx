import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";


const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "BookAja! - Booking Lapangan Online",
  description: "Pesan Lapangan Olahraga Dengan Mudah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} font-sans  antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
