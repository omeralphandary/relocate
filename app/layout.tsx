import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Realocate.ai — Your personal relocation guide",
    template: "%s — Realocate.ai",
  },
  description: "Stop juggling government websites and paperwork. Realocate.ai gives you a personalised, step-by-step relocation journey tailored to your destination and situation.",
  keywords: ["relocation", "moving abroad", "expat", "immigration", "AI relocation guide"],
  openGraph: {
    title: "Realocate.ai — Your personal relocation guide",
    description: "A personalised, AI-powered relocation checklist. Housing, banking, legal, telecom — all in one place.",
    type: "website",
    locale: "en_US",
    siteName: "Realocate.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Realocate.ai — Your personal relocation guide",
    description: "A personalised, AI-powered relocation checklist. Housing, banking, legal, telecom — all in one place.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased`}>
        <Script
          defer
          data-domain="realocate.ai"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <SessionProvider>{children}</SessionProvider>
        <div className="fixed bottom-3 right-3 z-50 text-[10px] font-semibold tracking-widest uppercase text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full pointer-events-none select-none">
          Beta
        </div>
      </body>
    </html>
  );
}
