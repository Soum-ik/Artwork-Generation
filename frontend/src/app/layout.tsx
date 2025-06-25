import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artwork Generator",
  description: "Generate artwork with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased font-sans"
        )}
      >
        <main className="relative flex flex-col min-h-screen">
          <Header />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary via-brand-secondary to-background opacity-20 glory-effect"></div>
          <div className="flex-grow flex-1 z-10">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
