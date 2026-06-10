import express from "express";
import { adminAuth } from "../../../middleware/adminAuth.js";
import { getAllBuyers } from "../controllers/buyer.controller.js";

const router = express.Router();

router.get("/all", adminAuth, getAllBuyers);

export default router;