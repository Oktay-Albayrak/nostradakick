import express from "express";
import cors from "cors";
import { config } from "../config.ts";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import { router as apiRouter } from "./routers/index.routes.ts";

export const app: Application = express();

// Autoriser les CORS (Cross-Origin Requests)
// ALLOWED_ORIGIN accepte plusieurs origines séparées par virgule
const allowedOrigins = config.allowedOrigin.split(",").map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origine non autorisée: ${origin}`));
    }
  },
  credentials: true
}));

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Configuration
app.use("/api", apiRouter);
