import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "Revival Studio | Furniture Repair, Resale & Room Planning UK",
  description: "UK's trusted destination for furniture repair, resale, and room planning. Get instant repair estimates, sell your furniture, or plan your perfect room.",
  keywords: "furniture repair, furniture resale, room planner, UK furniture, second hand furniture",
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
