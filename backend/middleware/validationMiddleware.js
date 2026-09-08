import Joi from "joi";

const registrationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty":
                "Name is required.",
            "string.min":
                "Name must contain at least 2 characters.",
            "string.max":
                "Name cannot exceed 100 characters.",
            "any.required":
                "Name is required.",
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .custom((value, helpers) => {
             if (value.includes("@")) {

            if (value.endsWith("@gmail.com")) {
                return value;
            }

            return helpers.error("string.gmailOnly");
        }

        return `${value}@gmail.com`;
    })
        .pattern(
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/
        )
        .required()
        .messages({
            "string.empty":
                "Gmail address is required.",

            "string.gmailOnly":
                "Only Gmail addresses are allowed.",

            "string.pattern.base":
                "Please provide a valid Gmail address.",

            "any.required":
                "Gmail address is required.",
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.empty":
                "Phone number is required.",

            "string.pattern.base":
                "Phone number must contain exactly 10 digits.",

            "any.required":
                "Phone number is required.",
        }),

    branch: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty":
                "Department is required.",

            "any.required":
                "Department is required.",
        }),

    gender: Joi.string()
        .valid("Male", "Female", "Other")
        .required()
        .messages({
            "any.only":
                "Invalid gender.",

            "any.required":
                "Gender is required.",
        }),

    year: Joi.string()
        .valid("1st Year", "2nd Year L.E")
        .required()
        .messages({
            "any.only":
                "Invalid year of study.",

            "any.required":
                "Year of study is required.",
        }),

    registrationType: Joi.string()
        .valid("ACM India", "Local Body Chapter", "ACM india", "local body chapter")
        .required()
        .messages({
            "any.only":
                "Invalid type of registration.",

            "any.required":
                "Type of registration is required.",
        }),

    payment: Joi.string()
        .valid("Online", "Offline")
        .required()
        .messages({
            "any.only":
                "Invalid payment mode.",

            "any.required":
                "Payment mode is required.",
        }),

    goodies: Joi.string()
        .valid("Yes", "No")
        .required()
        .messages({
            "any.only":
                "Invalid goodies selection.",

            "any.required":
                "Please select whether you want goodies.",
        }),
});


export const validateRegistration = (
    req,
    res,
    next
) => {
    // Support alias if passed as typeOfRegistration
    if (!req.body.registrationType && req.body.typeOfRegistration) {
        req.body.registrationType = req.body.typeOfRegistration;
    }

    // Normalize casing if needed
    if (typeof req.body.registrationType === "string") {
        const lower = req.body.registrationType.trim().toLowerCase();
        if (lower === "acm india") {
            req.body.registrationType = "ACM India";
        } else if (lower === "local body chapter") {
            req.body.registrationType = "Local Body Chapter";
        }
    }

    const { error, value } =
        registrationSchema.validate(
            req.body,
            {
                abortEarly: false,
                stripUnknown: true,
            }
        );

    if (error) {

        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: error.details.map(
                (detail) => detail.message
            ),
        });

    }

    req.body = value;

    next();
};