import type { Request, Response } from "express";
import { prisma, type User } from "../lib/prisma.ts";
import z from "zod";
import crypto from "node:crypto";
import argon2 from "argon2";
import { generateAccessToken, extractAccessTokenFromRequest, decodeJWT } from "../lib/auth.ts";

export async function registerUser(req: Request, res: Response) {
  // Validation des données
  const registerUserSchema = z.object({
    username: z
      .string()
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
      ),

    email: z.email('Email invalide'),

    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      )
  });

  // Récuperation et parsing du body
  const result = registerUserSchema.safeParse(req.body);

  if(!result.success) {
    return res.status(400).json({ error: result.error.issues.map((issue) => (issue.message)) });
  }

  const { username, email, password } = result.data;

  // Vérification : email déjà pris => 409 (Conflict)
  const alreadyExistingUserMail = await prisma.user.findFirst({ where: { email } });
  if (alreadyExistingUserMail) {
    return res.status(409).json({ error: ["Email déja utilisée"] });
  }

  // Autre vérification : username déjà pris => 409 (Conflict)
  const alreadyExistingUsername = await prisma.user.findFirst({ where: { username } });
  if (alreadyExistingUsername) {
    return res.status(409).json({ error: ["Pseudo déja utilisée"] });
  }

  try {
    // Hash du mdp
    const hashedPassword = await argon2.hash(password);

    // Enregistrement de l'utilisateur dans la BDD
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: hashedPassword
      },
      omit: {
        password_hash: true
      }
    })

    res.status(201).json(createdUser);

  } catch (error) {
    throw error;
  }
}

export async function loginUser(req: Request, res: Response) {
  // Récupérer l'email et le mot de passe depuis le body
  const loginUserSchema = z.object({
    email: z.string(),
    password: z.string()
  });
  
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues.map((issue) => (issue.message)) });
  }

  const { email, password } = result.data;

  // Récupérer l'utilisateur en BDD
  const user = await prisma.user.findUnique({ where: { email } });

  // Si pas d'utilisateur => 401
  if (!user) {
    return res.status(401).json({ error: ["Mauvais email / mot de passe"] });
  }

  // Compare les mots de passe (celui fourni dans le body avec celui haché de la BDD).
  const isMatching = await argon2.verify(user.password_hash, password);

  // Si pas de match => 401
  if (!isMatching) {
    return res.status(401).json({ error: ["Mauvais email / mot de passe"] });
  }

  // Générer le JWT
  const accessToken = generateAccessToken(user);

  // Générer et sauvegarder le refreshToken
  const refreshToken = await generateRefreshToken(user);

  // Le renvoyer dans les cookies
  setTokensInCookies(res, accessToken, refreshToken);

  res.json({ accessToken, refreshToken });
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  // Contrôler si l'utilisateur qui fait la requête (req) fournit un JWT
  const accessToken = extractAccessTokenFromRequest(req);

  // Pas de token = non connecté → 401 (normal, le client gère ce cas)
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(401).json({ error: "Non authentifié" });
  }

  let payload;
  try {
    payload = decodeJWT(accessToken);
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }

  if (!payload?.userId) {
    return res.status(401).json({ error: "Utilisateur non identifié" });
  }

  // Récupérer le user en BDD (sans son mot de passe)
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    omit: { password_hash: true }
  });

  // Si pas d'utilisateur correspondant au JWT fourni
  if (!user) {
    return res.status(401).json({ error: "Utilisateur non trouvé" });
  }

  // Le renvoyer
  res.json(user);
}

export async function refreshAccessToken(req: Request, res: Response) {
  // Récupérer le refresh token fourni (soit dans le body, soit dans les cookies)
  const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;

  // Si aucun token n'est fourni
  if (!rawToken) {
    return res.status(401).json({ error: "Refresh token manquant" });
  }

  // Valider son type (string)
  let token: string;
  try {
    token = z.string().parse(rawToken);
  } catch {
    return res.status(400).json({ error: "Format de token invalide" });
  }

  // Récupérer le refresh token en BDD (accompagné de son utilisateur)
  const refreshToken = await prisma.refreshToken.findFirst({
    where: { token },
    include: { user: true } // JOINTURE entre la table des "refreshToken" et la tables des "user"
  }); // { id, token, expires_at, user: {...} }

  // Si PAS EN BDD
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token invalide" });
  }

  // Si NON VALIDE
  // Si la date actuelle est APRES la date d'expiration du token, alors il est périmé
  if (new Date() > refreshToken.expires_at) {
    return res.status(401).json({ error: "Refresh token expiré" });
  }

  // Supprimer les refreshTokens de l'utilisateur avant d'en créer un autre
  await prisma.refreshToken.deleteMany({ where: { user_id: refreshToken.user_id } });

  // On génère des nouveaux tokens
  const accessToken = generateAccessToken(refreshToken.user);
  const newRefreshToken = await generateRefreshToken(refreshToken.user);

  // On les renvoies dans les cookies
  setTokensInCookies(res, accessToken, newRefreshToken);

  // Et également dans le body
  res.json({ accessToken, refreshToken: newRefreshToken });
}

export async function logoutUser(req: Request, res: Response) {
  // le backend renvoie des nouveaux cookies "vierges" pour écraser ceux qui sont côté client

  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // 1. Supprimer le refresh token de la BDD pour qu'il ne soit plus utilisable
      // Exemple avec Prisma :
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    // 2. Nettoyer les cookies sur le navigateur
    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'strict' });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'strict', path: "/api/auth/refresh" });

    return res.status(204).end();
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
}

export async function generateRefreshToken(user: User) {
  // Générer un refresh token (token opaque, ie. token sans information) de 7jours
  const refreshToken = crypto.randomBytes(64).toString("base64"); // chaine de caractère de 64 caractères aléatoire

  // Insérer le refresh token en BDD
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      //                   ^ nb de MS mtn  +   7 jours en MS
    }
  });

  return refreshToken;
}

function setTokensInCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, {
    maxAge: 1 * 60 * 60 * 1000, // 1h en MS
    httpOnly: true // en HTTPOnly, les cookies ne sont pas lisible par le code frontend (console.log(document.cookies) -> rien !)) => sécurité !
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en MS
    httpOnly: true,
    path: "/api/auth/refresh" // Pour préciser que le client ne doit envoyer le cookie que s'il fait une requête vers la route /api/auth/refresh (et pas sur les autres routes !)
  });
}
