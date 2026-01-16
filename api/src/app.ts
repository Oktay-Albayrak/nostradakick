import express from "express";
import cors from "cors";
import { config } from "../config.ts";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import { router as apiRouter } from "./routers/index.routes.ts";

export const app: Application = express();

// Autoriser les CORS (Cross-Origin Requests)
app.use(cors({
  origin: config.allowedOrigin,
  credentials: true
}));

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Configuration
app.use("/api", apiRouter);
