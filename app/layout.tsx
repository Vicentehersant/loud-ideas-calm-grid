import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import FigmaCapture from "@/components/FigmaCapture";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pin-new-branding-and-design-system.vercel.app"),
  openGraph: { title: "Loud ideas, calm grid — Pinterest redesign", description: "A new brand & design system for Pinterest. Vicente Hernaiz · UXDG 315.", type: "website" },
  twitter: { card: "summary_large_image", title: "Loud ideas, calm grid — Pinterest redesign" },
  title: "Loud Ideas, Calm Grid — Pinterest design direction",
  description:
    "UXDG 315 · Project 2 · Interface moodboard and design direction for a Pinterest redesign by Vicente Hernaiz.",
};

export const viewport: Viewport = { themeColor: "#ececec" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">
        {children}
        <FigmaCapture />
      </body>
    </html>
  );
}
