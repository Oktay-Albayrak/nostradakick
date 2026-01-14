import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
import z from "zod";
// import type { Prediction } from "../../generated/prisma/client";

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

export async function getOnePrediction(req: Request, res: Response) {
  const uuidSchema = z.uuid({
    message: "L'identifiant fourni n'est pas valide."
  });

  const paramId = await uuidSchema.parseAsync(req.params.id);

  const prediction = await prisma.prediction.findUnique({
    where: { id: paramId },
    include: {
      match: {
        include: { home_team: true, away_team: true, competition: true }
      },
      user: { select: { id: true, username: true, avatar_url: true } }
    }
  });

  if (!prediction) {
    return res.status(404).json({ error: "Prediction not found" });
  }

  res.json(prediction);
}


