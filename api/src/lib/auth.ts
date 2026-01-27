import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { config } from "../../config.ts";
import type { User } from "../../generated/prisma/client";

export function generateAccessToken(user: User) {
  // Génère un JWT
  // - Payload : 
  //   - userId
  //   - role
  // Signer : 
  //   - JWT_SECRET dans le .env (-> config.ts)
  // Durée de vie : 
  //   - 1h dans l'.env (-> config.ts)
  const paydload = {
    userId: user.id,
    userRole: user.role
  };
  const accessToken = jwt.sign(paydload, config.jwtSecret, { expiresIn: "1h" }); // JWT secret = sorte de "tampon" pour notre passport JWT qui atteste de sa non-falsification
  return accessToken;
}

export function extractAccessTokenFromRequest(req: Request) {
  // Récupérer l'accessToken depuis les cookies
  return req.cookies.accessToken;

  // Récupérer le header "authorization"
  // const authorizationHeader = req.headers.authorization; // "Bearer eyJhbGciOiJIUzI1..."
  // if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
  //   throw new Error("Authorization header missing or does not contain Bearer keyword");
  // }

  // Extraire la partie JWT du header (retirer le mot "Bearer")
  // const accessToken = authorizationHeader.substring("Bearer ".length); // "eyJhbGciOiJIUzI1...""
  // return accessToken;
}

export interface UserPayload extends JwtPayload {
  userId: string;
  userRole: 'MEMBER' | 'ADMIN';
}

export function decodeJWT(accessToken: string) {
  // Gestion des erreurs lors du décodage du payload
  // - non expiré
  // - non falsifié (signature)
  // - en extraire le payload { userId }

  try {
    const payload = jwt.verify(accessToken, config.jwtSecret) as UserPayload; // UserPayload => interface crée juste avant
    return payload;

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) { 
      throw new Error(`JWT error: ${error.message}`);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(`Expired JWT token`);
    }
  }
}
