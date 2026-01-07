import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether SOS - Disaster Relief Mesh Network",
  description: "A peer-to-peer mesh network app for disaster relief. When internet fails, your phone becomes part of a life-saving network. Everyone is a hero.",
  keywords: ["disaster relief", "mesh network", "SOS", "emergency", "BLE", "offline", "rescue"],
  authors: [{ name: "Aether SOS Team" }],
  openGraph: {
    title: "Aether SOS - Disaster Relief Mesh Network",
    description: "When internet fails, your phone becomes part of a life-saving network.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
