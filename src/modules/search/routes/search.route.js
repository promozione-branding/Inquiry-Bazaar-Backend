import express from "express";
import { getSearchPage, globalSearch } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", globalSearch);
router.get("/:slug", getSearchPage);

export default router;