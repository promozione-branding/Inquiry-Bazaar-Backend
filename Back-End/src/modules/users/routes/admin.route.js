import express from "express";
import { adminAuth } from "../../../middleware/adminAuth.js";
import { getAllBuyers, getAllSuppliers } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/suppliers", adminAuth, getAllSuppliers);
router.get("/buyers", adminAuth, getAllBuyers);

export default router;