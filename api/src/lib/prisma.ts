import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";

// Pour neon serverless
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ 
  connectionString 
});

export const prisma = new PrismaClient({ adapter });

export * from "../../generated/prisma/client.ts"