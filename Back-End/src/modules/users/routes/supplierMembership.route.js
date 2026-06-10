import express from "express";
import { createOrUpdateMembership, getMembershipBySupplier, } from "../controllers/supplierMembership.controller.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.put("/add/:id", adminAuth, createOrUpdateMembership);
router.get("/get/:id", adminAuth, getMembershipBySupplier);

export default router;