import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pune Real Estate Trend Intelligence Agent",
  description: "AI-powered trend analysis and content strategy for Pune & PCMC real estate market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
