import type { Request, Response, NextFunction } from "express";
import { extractAccessTokenFromRequest, decodeJWT } from "../lib/auth.ts";

// Middleware pour vérifier l'authentification
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = extractAccessTokenFromRequest(req);
    
    if (!accessToken) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    const payload = decodeJWT(accessToken);

    if (!payload?.userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // Ajouter le payload au request pour l'utiliser dans les routes
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// Middleware pour vérifier le rôle ADMIN
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = extractAccessTokenFromRequest(req);
    
    if (!accessToken) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    
    const payload = decodeJWT(accessToken);

    if (!payload?.userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (payload.userRole !== "ADMIN") {
      return res.status(403).json({ error: "Accès refusé. Rôle administrateur requis." });
    }

    // Ajouter le payload au request pour l'utiliser dans les routes
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
