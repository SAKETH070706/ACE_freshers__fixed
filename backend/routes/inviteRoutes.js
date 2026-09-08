import express from "express";

import { useInviteLink } from "../controllers/inviteController.js";

const router = express.Router();

/*
    Public — this is the link that goes out in the welcome
    email. It must be reachable without auth, but each token
    only works once (see oneTimeLinkService.redeemOneTimeLink).
*/
router.get("/use/:token", useInviteLink);

export default router;
