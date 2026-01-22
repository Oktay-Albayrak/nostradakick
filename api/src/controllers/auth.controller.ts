import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";
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

  // Le renvoyer dans les cookies
  setTokensInCookies(res, accessToken);

  res.json({ accessToken });
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  // Controler si l'utilisateur qui fait la requête (req) fourni un JWT
  const accessToken = extractAccessTokenFromRequest(req);

  if (accessToken === null) {
    throw new Error("Utilisateur non identifié");
  }

  const payload = decodeJWT(accessToken);

  // Condition pour enlever erreur prisma
  if (!payload?.userId) {
    throw new Error("Utilisateur non identifié");
  }

  // Récupérer le user en BDD (sans son mot de passe)
  const user = await prisma.user.findUnique({
    where: { id: payload?.userId },
    omit: { password_hash: true }
  });

  // Si pas d'utilisateur correspondant au JWT fourni
  if (!user) {
    throw new Error("Provided JWT does not match any user currently in database");
  }

  // Le renvoyer
  res.json(user);
}

export async function logoutUser(req: Request, res: Response) {
  // le backend renvoie des nouveaux cookies "vierges" pour écraser ceux qui sont côté client

  res.clearCookie("accessToken");
  res.status(204).end(); // No Content
}

function setTokensInCookies(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    maxAge: 1 * 60 * 60 * 1000, // 1h en MS
    httpOnly: true // en HTTPOnly, les cookies ne sont pas lisible par le code frontend (console.log(document.cookies) -> rien !)) => sécurité !
  });
}
