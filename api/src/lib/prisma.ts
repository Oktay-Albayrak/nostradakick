import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

// Pour neon serverless
const connectionString = `${process.env.DATABASE_URL}`;

// Neon en prod, pg en local — décidé par l'env
const adapter = 
  process.env.DB_DRIVER === "neon" 
    ? new PrismaNeon({ connectionString }) 
    : new PrismaPg({connectionString});

export const prisma = new PrismaClient({ adapter });

export * from "../../generated/prisma/client.ts"