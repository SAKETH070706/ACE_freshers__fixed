import express from "express";

import {
    register
} from "../controllers/registrationController.js";

import {
    validateRegistration
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post(
    "/",
    validateRegistration,
    register
);

export default router;