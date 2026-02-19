import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
