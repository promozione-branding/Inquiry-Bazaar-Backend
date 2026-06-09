import express from "express";
import { getAllProducts, getProductBySlug } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/all", getAllProducts);
router.get("/:slug", getProductBySlug);

export default router;