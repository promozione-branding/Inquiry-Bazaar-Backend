import express from "express";
import { adminMe, adminLogin, updateAdminProfile, changeAdminPassword, getAdminSettings } from "../controllers/userAuth.controller.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.get("/admin/me", adminAuth, adminMe);
router.put("/admin/profile", adminAuth, updateAdminProfile);
router.put("/admin/change-password", adminAuth, changeAdminPassword);
// Add to your existing router
router.get("/admin/settings", adminAuth, getAdminSettings);

export default router;