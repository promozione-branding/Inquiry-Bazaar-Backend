import express from "express";
import { getLeadsByDateController, getSupplierInquiryController, } from "../controllers/lead.controller.js";

const router = express.Router();

// GET leads by user ID and date range
router.get("/report/:userId", getLeadsByDateController);
router.get("/supplier/:userId", getSupplierInquiryController);

export default router;