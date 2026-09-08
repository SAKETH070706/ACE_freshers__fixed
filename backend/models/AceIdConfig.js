import mongoose from "mongoose";

const aceIdConfigSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            default: "aceIdConfig",
        },

        frequencies: {
            A: {
                type: Number,
                required: true,
            },

            B: {
                type: Number,
                required: true,
            },

            C: {
                type: Number,
                required: true,
            },

            D: {
                type: Number,
                required: true,
            },
        },

        counters: {
            A: {
                type: Number,
                default: 0,
            },

            B: {
                type: Number,
                default: 0,
            },

            C: {
                type: Number,
                default: 0,
            },

            D: {
                type: Number,
                default: 0,
            },
        },

        currentLetter: {
            type: String,
            enum: ["A", "B", "C", "D"],
            default: "A",
        },
    },
    {
        timestamps: true,
    }
);

const AceIdConfig =
    mongoose.model(
        "AceIdConfig",
        aceIdConfigSchema
    );

export default AceIdConfig;