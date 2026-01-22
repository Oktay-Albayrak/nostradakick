// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// 1. Définition du type de données partagées
interface AuthContextType {
  isLoggedIn: boolean;
  user_id: string | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// 2. Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user_id, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Très important pour éviter les flashs d'UI

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
  };

  // Fonction pour recharger les données d'auth (utile après une connexion)
  const refreshAuth = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        setUserId(userData.id);
        console.log("✅ Auth rafraîchi, user_id:", userData.id);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement auth:", error);
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  // Ce useEffect s'exécute UNE SEULE FOIS au chargement du site
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/auth/me", {
          method: "GET",
          credentials: "include", // Envoie les cookies au backend
        });

        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUserId(userData.id);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
        }
      } catch (error) {
        console.error("Erreur de vérification auth:", error);
        setIsLoggedIn(false);
        setUserId(null);
      } finally {
        setIsLoading(false); // La vérification est terminée
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user_id, login, logout, refreshAuth }}>
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
