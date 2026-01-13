import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";

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
    <html lang="fr">
      <body>
          <Header />
            {children}
          <Footer />
      </body>
    </html>
  );
}
