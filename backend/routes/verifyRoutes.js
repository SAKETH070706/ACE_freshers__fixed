import express from "express";
import { verifyCertificate } from "../controllers/verifyController.js";

const router = express.Router();

router.get("/:aceId", verifyCertificate);

export default router;
