import express from "express";
import { getWebpageByUserId, getWebpageBySlug, updateWebpageImageAlt } from "../controllers/userWebpage.controller.js";

const router = express.Router();

router.get("/:slug", getWebpageBySlug);
router.get("/user/:id", getWebpageByUserId);
router.put("/alt/:id", updateWebpageImageAlt);

export default router;