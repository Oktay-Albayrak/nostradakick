// context/AuthContext.tsx
/**
 * CONTEXTE D'AUTHENTIFICATION - Gestion de l'état utilisateur global
 * 
 * Ce fichier crée un contexte React qui permet de partager l'état d'authentification
 * de l'utilisateur dans toute l'application sans prop drilling.
 * 
 * Il gère :
 * - L'état de connexion (isLoggedIn)
 * - L'ID de l'utilisateur (user_id) 
 * - Les fonctions de connexion/déconnexion
 * - Le rafraîchissement des données d'auth
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// 1. Définition du type de données partagées
/**
 * Interface AuthContextType
 * 
 * Définit la structure des données partagées via le contexte :
 * - isLoggedIn: booléen indiquant si l'utilisateur est connecté
 * - user_id: UUID de l'utilisateur connecté (ou null)
 * - login(): fonction appelée après une connexion réussie
 * - logout(): fonction pour déconnecter l'utilisateur
 * - refreshAuth(): fonction pour recharger les données d'auth depuis l'API
 */
interface AuthContextType {
  isLoggedIn: boolean;
  user_id: string | null;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// 2. Création du contexte avec une valeur par défaut
/**
 * createContext crée un contexte React avec une valeur par défaut undefined.
 * Le contexte est typé avec notre interface AuthContextType.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * COMPOSANT AUTHPROVIDER
 * 
 * Composant wrapper qui :
 * 1. Gère l'état d'authentification (isLoggedIn, user_id, isLoading)
 * 2. Vérifie si l'utilisateur est toujours connecté au chargement
 * 3. Fournit les fonctions de gestion d'authentification
 * 4. Affiche un écran de chargement pendant la vérification
 * 
 * À utiliser : envelopper le root layout avec <AuthProvider>{children}</AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // État pour savoir si l'utilisateur est connecté
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // UUID de l'utilisateur connecté
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
      const response = await fetch("http://localhost:4000/api/auth/me", {
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

  // Ce useEffect s'exécute UNE SEULE FOIS au chargement du site
  /**
   * USEEFFECT - VÉRIFICATION D'AUTHENTIFICATION AU DÉMARRAGE
   * 
   * S'exécute une seule fois ([] dépendances vides) lors du montage du composant.
   * 
   * Objectif :
   * - Vérifier si l'utilisateur a une session valide (cookie de session)
   * - Si oui : récupère son ID et met à jour l'état
   * - Si non : réinitialise l'état
   * - Met ensuite isLoading à false pour afficher l'app
   * 
   * Avantage :
   * - L'utilisateur n'a pas besoin de se reconnecter à chaque rafraîchissement
   * - La session persiste grâce aux cookies
   */
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
