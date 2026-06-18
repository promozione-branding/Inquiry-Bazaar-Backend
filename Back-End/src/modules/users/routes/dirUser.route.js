import express from "express";
import { getMe } from "../controllers/dirUser.controller.js";

const router = express.Router();

// router.post("/admin/login", adminLogin);
router.get("/me", getMe);

export default router;