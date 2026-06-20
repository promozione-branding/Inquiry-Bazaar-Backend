import express from "express";
import { getAllProducts, getProductBySlug, getSupplierProducts } from "../controllers/product.controller.js";
import { updateProductMediaAlt } from "../controllers/productMedia.controller.js";

const router = express.Router();

router.get("/all", getAllProducts);
router.get("/:slug", getProductBySlug);
router.get("/supplier/:supplierId", getSupplierProducts);

router.put("/media/:mediaId", updateProductMediaAlt);

export default router;