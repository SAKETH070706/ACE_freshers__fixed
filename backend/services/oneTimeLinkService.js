import crypto from "crypto";

import OneTimeLink from "../models/OneTimeLink.js";

const getBaseUrl = () => {
    const base = process.env.BACKEND_URL;

    if (!base) {
        throw new Error(
            "BACKEND_URL is not set. It must be the publicly reachable " +
            "URL of this backend (e.g. https://api.yourdomain.com) so " +
            "one-time invite links can be built."
        );
    }

    return base.replace(/\/+$/, "");
};

/*
    Create a one-time-use link that redirects to `targetUrl`
    exactly once, then self-destructs.

    Returns the full public URL to email/share, e.g.
    "https://api.yourdomain.com/api/invite/use/<token>".
*/
export const createOneTimeLink = async (targetUrl) => {

    if (!targetUrl) {
        throw new Error("createOneTimeLink: targetUrl is required.");
    }

    // Validate config before touching the database.
    const baseUrl = getBaseUrl();

    const token = crypto.randomBytes(16).toString("hex");

    await OneTimeLink.create({
        token,
        targetUrl,
    });

    return `${baseUrl}/api/invite/use/${token}`;
};

/*
    Atomically consume a token.

    findOneAndDelete is atomic at the database level: if two
    requests hit this at nearly the same time (e.g. someone
    forwards the link), only the first one gets the document
    back — the second gets null and is told the link is
    invalid/used, exactly like the original one-time-link
    server.

    Returns the target URL to redirect to, or null if the
    token was invalid, expired, or already used.
*/
export const redeemOneTimeLink = async (token) => {

    const consumed = await OneTimeLink.findOneAndDelete({ token });

    return consumed ? consumed.targetUrl : null;
};
