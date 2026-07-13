import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./ui/header";
import Footer from "./ui/footer";
import { CartProvider } from "./context/Cart/CartProvider";
import { HeaderSkeleton } from "./ui/skeletons";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: 'Swag Store | %s',
    default: 'Swag Store',
  },
  description: 'A swag store is a curated online shop featuring company-branded merchandise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Suspense fallback={<HeaderSkeleton />}>
            <Header />
          </Suspense>
          <main className="min-h-full flex flex-col">{children}</main>
        </CartProvider>
        <Suspense>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
