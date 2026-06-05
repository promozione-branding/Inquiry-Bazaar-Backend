import express from "express";
import { getAllCategories, getMainCategories, getSubCategories, getSubCategoryDetails } from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/main", getMainCategories);
router.get("/:parentCategoryId", getSubCategories);
router.get("/sub/:slug", getSubCategoryDetails);

export default router;