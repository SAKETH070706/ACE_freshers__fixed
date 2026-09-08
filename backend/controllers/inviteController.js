import { redeemOneTimeLink } from "../services/oneTimeLinkService.js";

export const useInviteLink = async (req, res) => {

    try {

        const { token } = req.params;

        const targetUrl = await redeemOneTimeLink(token);

        if (!targetUrl) {

            return res
                .status(400)
                .send("This invite link is invalid, expired, or has already been used.");

        }

        return res.redirect(targetUrl);

    } catch (error) {

        console.error("Error redeeming invite link:", error.message);

        return res.status(500).send("Server error while processing this invite link.");

    }

};
