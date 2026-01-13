import express from "express";
import type { Application } from "express";
import { router as apiRouter } from "./routers/index.routes.ts";

export const app: Application = express();

// Configuration
app.use("/api", apiRouter);
