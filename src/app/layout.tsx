import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Plus Marketing - Car Dealership",
  description: "Plus Marketing - Your trusted partner for quality vehicles. Buy and sell cars with confidence.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plus Marketing",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png" }],
  },
  openGraph: {
    title: 'Plus Marketing - Car Dealership',
    description: 'Your trusted partner for quality vehicles',
    images: [{ url: '/icon-512x512.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plus Marketing - Car Dealership',
    description: 'Your trusted partner for quality vehicles',
    images: ['/icon-512x512.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen p-4">{children}</main>
      </body>
    </html>
  );
}
