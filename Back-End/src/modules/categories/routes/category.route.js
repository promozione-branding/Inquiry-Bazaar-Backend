import express from "express";
import { addCategory, addCategoryCoverageController, deleteCategory, editCategory, getAllCategories, getCategoryById, getCategoryCoverageController, getMainCategories, getSubCategories, getSubCategoryDetails, getSubCategoryLocationDetails, removeCategoryCoverageController } from "../controllers/category.controller.js";
import { upload } from "../../../middleware/upload.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/main", getMainCategories);
router.get("/:parentCategoryId", getSubCategories);
router.get("/sub/:slug", getSubCategoryDetails);
router.get("/sub/:slug/:location", getSubCategoryLocationDetails);

router.post("/add", upload.single("file"), adminAuth, addCategory);
router.get("/get/:id", adminAuth, getCategoryById);
router.put("/edit/:id", upload.single("file"), adminAuth, editCategory);
router.delete("/delete/:id", adminAuth, deleteCategory);

router.post("/coverage", adminAuth, addCategoryCoverageController);
router.delete("/coverage", adminAuth, removeCategoryCoverageController);
router.get("/coverage/:supplierId", getCategoryCoverageController);

export default router;