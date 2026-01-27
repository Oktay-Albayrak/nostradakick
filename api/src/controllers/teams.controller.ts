import type { Request, Response } from "express";
import * as teamService from "../services/team.service.ts";

// RÉCUPÉRER TOUTES LES ÉQUIPES
export async function getAllTeams(req: Request, res: Response) {
  try {
    const teams = await teamService.findAllTeams();
    res.json(teams);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des équipes (controller.getAllTeams) :",
      error
    );
    res.status(500).json({ message: "Erreur lors de la récupération des équipes" });
  }
}
