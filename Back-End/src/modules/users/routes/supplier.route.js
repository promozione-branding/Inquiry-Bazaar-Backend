import express from "express";
import { adminAuth } from "../../../middleware/adminAuth.js";
import { addServiceLocation, getAllSuppliers, getSupplierById, removeServiceLocation } from "../controllers/supplier.controller.js";

const router = express.Router();

router.get("/all", adminAuth, getAllSuppliers);
router.get("/:id", adminAuth, getSupplierById);
router.put("/add/service-location/:id", adminAuth, addServiceLocation);
router.delete("/remove/service-location/:id", adminAuth, removeServiceLocation);

export default router;