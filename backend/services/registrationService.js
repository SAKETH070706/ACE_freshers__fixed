const formatTitleCase = (str) => {
    if (!str) return "";
    return String(str)
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};
import Registration from "../models/Registration.js";
import { sendWelcomeEmailWithRetry } from "./emailService.js";
import { generateAceId } from "./aceIdService.js";
import { generateCertificate, cleanupCertificate } from "./certificateService.js";

export const registerUser = async (data) => {
    const {
        name: rawName,
        email,
        phone,
        branch,
        gender,
        year,
        mode = "Normal",
        payment,
        goodies,
        registrationType = data.typeOfRegistration || "ACM India",
    } = data;

    const name = formatTitleCase(rawName);

    // Check duplicate email
    const existingEmail = await Registration.findOne({ email });
    if (existingEmail) {
        const error = new Error("This email is already registered.");
        error.statusCode = 409;
        throw error;
    }

    // Check duplicate phone
    const existingPhone = await Registration.findOne({ phone });
    if (existingPhone) {
        const error = new Error("This phone number is already registered.");
        error.statusCode = 409;
        throw error;
    }

    // Generate ACE ID
    const aceId = await generateAceId();

    // Save registration
    const registration = await Registration.create({
        aceId,
        name,
        email,
        phone,
        branch,
        gender,
        year,
        mode,
        registrationType,
        payment,
        goodies,
    });

    // Generate PDF Certificate
    let certificatePath = null;
    try {
        certificatePath = await generateCertificate({
            name,
            email,
            phone,
            aceId,
            branch,
            gender,
            year,
            mode,
            registrationType,
            payment,
            goodies,
        });
    } catch (certError) {
        console.error(
            `Failed to generate certificate for ${email}:`,
            certError.message
        );
    }

    // Trigger certificate + email workflow
    try {
        const sent = await sendWelcomeEmailWithRetry({
            name,
            email,
            phone,
            aceId,
            branch,
            gender,
            year,
            mode,
            payment,
            goodies,
            registrationType: registration.registrationType,
            certificatePath,
        });
        registration.emailStatus = sent ? "Sent" : "Failed";
    } catch (error) {
        console.error(
            `Welcome email workflow failed for ${email}:`,
            error.message
        );
        registration.emailStatus = "Failed";
    } finally {
        if (certificatePath) {
            await cleanupCertificate(certificatePath);
        }
    }

    await registration.save();

    return {
        aceId: registration.aceId,
        registration: {
            id: registration._id,
            name: registration.name,
            email: registration.email,
        },
        emailStatus: registration.emailStatus,
    };
};
