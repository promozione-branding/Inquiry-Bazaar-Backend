import express from "express";
import { getAllCategories, getMainCategories, getSubCategories } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/main", getMainCategories);
router.get("/:parentCategoryId", getSubCategories);

export default router;