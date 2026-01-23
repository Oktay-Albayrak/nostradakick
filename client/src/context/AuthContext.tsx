// Contexte global pour l'état d'authentification
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  user_id: string | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Wrapper fournissant l'état d'authentification et ses fonctions de gestion
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user_id, setUserId] = useState<string | null>(null);
  
  // État de chargement pour éviter les flashs d'UI pendant la vérification
  // Important : on ne montre pas l'appli tant qu'on ne sait pas l'état auth
  const [isLoading, setIsLoading] = useState(true);

  // Fonction appelée après une connexion réussie
  const login = () => setIsLoggedIn(true);
  
  // Fonction de déconnexion - réinitialise tous les états
  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
  };

  /**
   * FONCTION REFRESHAUTH
   * 
   * Recharge les données d'authentification depuis l'API.
   * Utilisée après une connexion pour récupérer immédiatement l'user_id.
   * 
   * Appel API :
   * - GET /api/auth/me (avec credentials pour les cookies)
   * 
   * Mise à jour :
   * - Si OK : récupère userData.id et met à jour isLoggedIn + user_id
   * - Si erreur : réinitialise l'état d'authentification
   */
  const refreshAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/auth/me`, {
        method: "GET",
        credentials: "include", // Envoie les cookies de session
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

  // Vérifie la session au démarrage et récupère l'ID utilisateur via /api/auth/me
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/auth/me`, {
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
        // IMPORTANT : termine le chargement pour afficher l'app
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user_id, login, logout, refreshAuth }}>
      {/* 
        Affichage conditionnel :
        - Si isLoading = true : affiche un écran de chargement
        - Si isLoading = false : affiche l'application
        
        Cela évite un "flash" où l'app s'affiche sans le contexte chargé,
        ce qui pourrait causer des redirections mal coordonnées.
      */}
      {!isLoading ? children : <div className="loading-spinner">Chargement...</div>}
    </AuthContext.Provider>
  );
}

/**
 * HOOK USEAUTH
 * 
 * Hook custom pour accéder au contexte d'authentification dans tous les composants.
 * 
 * Usage :
 * const { isLoggedIn, user_id, login, logout, refreshAuth } = useAuth();
 * 
 * Lève une erreur si utilisé en dehors d'un AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
