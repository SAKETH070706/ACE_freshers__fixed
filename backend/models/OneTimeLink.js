import mongoose from "mongoose";

/*
    Generic one-time-use redirect link.

    `targetUrl` is whatever the token should redirect to once
    (a WhatsApp group invite, in our case). Storing the target
    on the document itself — instead of a single global
    WHATSAPP_LINK — lets the same mechanism serve different
    links (1st year vs 2nd year group) from one collection.

    TTL index: MongoDB automatically deletes the document
    24 hours after creation, even if it's never redeemed, so
    unused tokens don't pile up forever.
*/
const oneTimeLinkSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    targetUrl: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // 24 hours, in seconds
    },
});

const OneTimeLink = mongoose.model("OneTimeLink", oneTimeLinkSchema);

export default OneTimeLink;
