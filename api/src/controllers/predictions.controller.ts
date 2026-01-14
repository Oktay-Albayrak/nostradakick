import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";
// import { Prediction } from "../../generated/prisma/client";

export async function getAllPredictions(req: Request, res: Response) {
  const predictions = await prisma.prediction.findMany({
    include: {
      match: {
        omit: { api_id: true },
        include: { home_team: true, away_team: true, competition: true }
      },
      user: { select: { id: true, username: true, avatar_url: true } }
    }
  });
  res.json(predictions);
}