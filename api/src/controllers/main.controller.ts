import type { Request, Response } from "express";

export function healthCheck(req: Request, res: Response) {
  const status = true;
  const ip = req.ip;
  const date = new Date();
  const headers = req.headers;
  res.json({ status, ip, date, headers });
}
