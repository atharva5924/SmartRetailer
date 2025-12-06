import express from "express";
const router = express.Router();
import {
  getSales,
  getFilterOptions,
} from "../controllers/sales.controllers.js";

router.get("/sales", getSales);
router.get("/filter-options", getFilterOptions);

export default router;
