import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
import registerRoutes from "./routes/registerRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

/*
    Restrict CORS to the configured frontend origin(s) instead of
    reflecting any origin. Supports a comma-separated list in
    FRONTEND_URL for multiple environments (e.g. local + deployed).
*/
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header, e.g. curl/Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "ACM Registration API is running."
    });

});

app.use(
    "/api/registrations",
    registerRoutes
);
app.use(
    "/api/invite",
    inviteRoutes
);

app.use(errorMiddleware);

export default app;