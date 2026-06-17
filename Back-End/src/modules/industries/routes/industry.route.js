import express from "express";
import { addIndustry, editIndustry, getAllIndustries, getIndustry, getIndustryBySlug, getIndustryTree, removeIndustry } from "../controllers/industry.controller.js";
import { upload } from "../../../middleware/upload.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAllIndustries);
router.get("/tree", getIndustryTree);
router.get("/:slug", getIndustryBySlug);
router.post("/add", upload.single("file"), adminAuth, addIndustry);
router.get("/get/:id", adminAuth, getIndustry);
router.put("/edit/:id", upload.single("file"), adminAuth, editIndustry);
router.delete("/delete/:id", adminAuth, removeIndustry);

export default router;