import express from "express";
import { assignEmployee, getEmployee, } from "../controllers/employee.controller.js";
import { adminAuth } from "../../../middleware/adminAuth.js";

const router = express.Router();

router.post("/", adminAuth, assignEmployee);
router.get("/:userId", adminAuth, getEmployee);

export default router;