import type { Metadata } from "next";
import { Encode_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const encodeSans = Encode_Sans({
  variable: "--font-encode-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zweitsprache",
  description: "Zweitsprache – Workshops & Kurse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${encodeSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
