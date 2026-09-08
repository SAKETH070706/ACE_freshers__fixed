import axios from "axios";

const rawBaseUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

const API = axios.create({
    baseURL: rawBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export const registerParticipant = async (data) => {
    const endpoint = rawBaseUrl.endsWith("/api")
        ? "/registrations"
        : "/api/registrations";

    const response = await API.post(
        endpoint,
        data
    );

    return response.data;
};