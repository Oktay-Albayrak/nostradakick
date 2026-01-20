import { prisma } from "../lib/prisma.ts";
import type { Request, Response } from "express";

export async function getAllCompetitions(req: Request, res: Response) {
  try {
    const competitions = await prisma.competition.findMany({
      where: {
        code: {
          in: ["PL", "FL1", "PD", "BL1", "SA", "CL"],
        },
      },
    });
    res.json(competitions);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des compétitions" });
  }
}
