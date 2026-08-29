import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { getSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waterpointboarduganda.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WaterPoint Board Uganda",
    template: "%s · WaterPoint Board Uganda",
  },
  description:
    "Community-reported water-point status and maintenance tracking for one small Ugandan community — a full-stack demonstration project.",
  openGraph: {
    title: "WaterPoint Board Uganda",
    description:
      "Community-reported water-point status and maintenance tracking for one small Ugandan community.",
    url: siteUrl,
    siteName: "WaterPoint Board Uganda",
    locale: "en_UG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaterPoint Board Uganda",
    description:
      "Community-reported water-point status and maintenance tracking for one small Ugandan community.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavBar session={session} />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
