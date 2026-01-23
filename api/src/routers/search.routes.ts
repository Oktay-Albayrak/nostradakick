import { Router } from "express";
import { getSearchSuggestions } from "../controllers/search.controller.ts";

export const router: Router = Router();

router.get("/search/suggestions", getSearchSuggestions);
