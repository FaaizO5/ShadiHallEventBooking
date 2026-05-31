import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./_components/Providers";
import Nav from "./_components/Nav";
import Footer from "./_components/Footer";

// Editorial serif for headings, clean sans for body — exposed as CSS
// variables and wired into the Tailwind theme (--font-serif / --font-sans).
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shaadi Halls — Wedding Venues, Beautifully Booked",
  description:
    "Browse exquisite wedding halls and request your date and slot. Curated venues, admin-approved bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-charcoal">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
