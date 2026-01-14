import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
// import { Prediction } from "../../generated/prisma/client";

export async function getAllPredictions(req: Request, res: Response) {
  const predictions = await prisma.prediction.findMany({
    include: {
      match: {
        include: { home_team: true, away_team: true, competition: true } // Include pour faire appel a la relation et avoir les détails des matchs grace aux ids
      },
      user: { select: { id: true, username: true, avatar_url: true } } // Sélectionner seulement les infos publics
    }
  });
  res.json(predictions);
}