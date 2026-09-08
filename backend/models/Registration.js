import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        aceId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index:true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        branch: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"],
        },

        year: {
            type: String,
            required: true,
            enum: ["1st Year", "2nd Year L.E"],
        },

        registrationType: {
            type: String,
            required: true,
            enum: ["ACM India", "Local Body Chapter", "ACM india", "local body chapter"],
            default: "ACM India",
        },

        payment: {
            type: String,
            required: true,
            enum: ["Online", "Offline"],
        },

        goodies: {
            type: String,
            required: true,
            enum: ["Yes", "No"],
        },

        emailStatus: {
            type: String,
            enum: ["Pending", "Sent", "Failed"],
            default: "Pending",
        },

        registeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

export default Registration;