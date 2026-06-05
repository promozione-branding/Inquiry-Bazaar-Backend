import express from "express";
import { adminMe, adminLogin } from "../controllers/userAuth.controller.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.get("/admin/me", adminAuth, adminMe);

export default router;