import express from "express";
import { getWebpageBySlug } from "../controllers/userWebpage.controller.js";

const router = express.Router();

router.get("/:slug", getWebpageBySlug);

export default router;