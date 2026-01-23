// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// 1. Définition du type de données partagées
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// 2. Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Très important pour éviter les flashs d'UI

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  // Ce useEffect s'exécute UNE SEULE FOIS au chargement du site
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/auth/me`, {
          method: "GET",
          credentials: "include", // Envoie les cookies au backend
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Erreur de vérification auth:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // La vérification est terminée
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {/* On peut choisir de ne rien afficher tant qu'on ne sait pas si l'user est connecté */}
      {!isLoading ? children : <div className="loading-spinner">Chargement...</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
