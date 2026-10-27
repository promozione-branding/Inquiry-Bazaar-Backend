import express from "express";
import { adminAuth } from "../../../middleware/adminAuth.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", adminAuth, getAdminDashboard);

export default router;