import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const registerParticipant = async (data) => {
    const response = await API.post(
        "/registrations",
        data
    );

    return response.data;
};