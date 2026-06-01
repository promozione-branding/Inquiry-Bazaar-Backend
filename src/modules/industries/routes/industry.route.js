import express from "express";
import { getAllIndustries, getIndustryBySlug, getIndustryTree } from "../controllers/industry.controller.js";

const router = express.Router();

router.get("/", getAllIndustries);
router.get("/tree", getIndustryTree);
router.get("/:slug", getIndustryBySlug);

export default router;