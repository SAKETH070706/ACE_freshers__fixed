import express from "express";
import rateLimit from "express-rate-limit";

import {
    register
} from "../controllers/registrationController.js";

import {
    validateRegistration
} from "../middleware/validationMiddleware.js";

const router = express.Router();

const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 40, // Limit each IP to 40 registrations per 15 min (accommodates busy registration desks)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registrations submitted from this network. Please wait a few minutes before trying again.",
    },
});

router.post(
    "/",
    registrationLimiter,
    validateRegistration,
    register
);

export default router;