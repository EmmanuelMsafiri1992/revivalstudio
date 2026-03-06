import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "Revival Studio | Furniture Repair, Resale & Room Planning UK",
  description: "UK's trusted destination for furniture repair, resale, and room planning. Get instant repair estimates, sell your furniture, or plan your perfect room.",
  keywords: "furniture repair, furniture resale, room planner, UK furniture, second hand furniture",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen flex flex-col bg-[#faf8f5]">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
