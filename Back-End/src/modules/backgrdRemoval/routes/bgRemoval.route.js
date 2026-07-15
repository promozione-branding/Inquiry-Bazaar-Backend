import express from "express";
import multer from "multer";
import { removeBgImage } from "../controllers/bgRemoval.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } });

const router = express.Router();

// Define endpoint
router.post("/", upload.single("file"), removeBgImage);

export default router;
