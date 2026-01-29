import { prisma } from "../lib/prisma.ts";

export async function findAllTeams(searchQuery?: string, limit?: number) {
  const teams = await prisma.team.findMany({
    ...(searchQuery && {
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" as const } },
          { short_name: { contains: searchQuery, mode: "insensitive" as const } },
          { tla: { contains: searchQuery, mode: "insensitive" as const } },
        ],
      },
    }),
    ...(limit && { take: limit }),
    orderBy: { name: "asc" },
  });
  return teams;
}
