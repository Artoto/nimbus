import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../compornent/Header";
import Footer from "../compornent/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js with NextAuth",
  description: "A Next.js application with authentication using NextAuth.js",
};

interface userProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  buyer?: string | null; // จาก Grist
  gristName?: string | null; // จาก Grist
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className}  antialiased`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
