import express from "express";
import { adminAuth } from "../../../middleware/adminAuth.js";
import { getAllHelpRequests, getHelpRequestById, replyHelpRequest } from "../controllers/help.controller.js";

const router = express.Router();

router.get("/all/:role", adminAuth, getAllHelpRequests);
router.get("/:id", adminAuth, getHelpRequestById);
router.put("/reply/:id", adminAuth, replyHelpRequest);

export default router;