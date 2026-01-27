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
      let response = await fetch("http://localhost:4000/api/auth/me", {
        method: "GET",
        credentials: "include", // Envoie les cookies de session
      });

      // 2. Si l'access token est expiré ou invalide (ex: 401)
      if (!response.ok) {
        // 3. Deuxième tentative : on appelle /refresh pour obtenir un nouvel Access Token
        const refreshResponse = await fetch("http://localhost:4000/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          console.log("✅ Token rafraîchi avec succès");
          // 4. On re-tente l'appel /me original pour récupérer les données user
          response = await fetch("http://localhost:4000/api/auth/me", {
            method: "GET",
            credentials: "include",
          });
        } else {
          // Le refresh token est aussi mort (ex: plus de 7 jours)
          setIsLoggedIn(false);
          setUserId(null);
        }
      }

      // 5. Si on arrive ici et que la réponse est OK (soit du 1er coup, soit après refresh)
      if (response.ok) {
        const userData = await response.json();
        setIsLoggedIn(true);
        setUserId(userData.id);
      }
    } catch (error) {
      console.error("Erreur auth:", error);
      setIsLoggedIn(false);
      setUserId(null);
    } finally {
      // On s'assure que le chargement s'arrête quoi qu'il arrive
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    refreshAuth();
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
