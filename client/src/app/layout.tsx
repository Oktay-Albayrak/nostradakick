import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import MobileNavbar from "@/components/mobileNavbar/MobileNavbar";

export const metadata: Metadata = {
  title: "NostradaKick",
  description: "Projet de pronostics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
          {children}
        <Footer />
        <MobileNavbar />
      </body>
    </html>
  );
}
