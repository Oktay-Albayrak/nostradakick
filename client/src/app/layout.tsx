import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import SearchContainer from "@/components/search/searchContainer";
import { API_URL } from "@/config/api";
(globalThis as any).API_URL = API_URL;


export const metadata: Metadata = {
  title: "NostradaKick",
  description: "Projet de pronostics",
};

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={ubuntu.className}>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <SearchContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
