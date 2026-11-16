import express from "express";
import { getLeadsByDateController, } from "../controllers/lead.controller.js";

const router = express.Router();

// GET leads by user ID and date range
router.get("/report/:userId", getLeadsByDateController);

export default router;