import { prisma } from "../lib/prisma.ts";

export async function findAllTeams() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });
  return teams;
}
