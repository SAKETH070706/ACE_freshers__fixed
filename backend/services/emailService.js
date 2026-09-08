import dotenv from "dotenv";
import fs from "fs";
import { generateCertificate } from "./certificateService.js";

dotenv.config();

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

export const sendWelcomeEmail = async ({
  name: rawName,
  email,
  phone,
  aceId,
  branch,
  gender,
  year,
  mode = "Normal",
  payment,
  goodies,
  registrationType = "ACM India",
  certificatePath: existingCertPath = null,
}) => {
  const name = formatTitleCase(rawName);

  // Generate certificate if not provided
  let certificatePath = existingCertPath;
  if (!certificatePath) {
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
  }

  // Certificate attachment
  const attachments = [];
  if (certificatePath && fs.existsSync(certificatePath)) {
    attachments.push({
      name: `ACM_Certificate_${aceId || "Membership"}.pdf`,
      content: fs.readFileSync(certificatePath).toString("base64"),
    });

    try {
      fs.unlinkSync(certificatePath);
    } catch (e) {
      // Ignored if already removed
    }
  }

  // Social links from .env
  let whatsappLink = process.env.WHATSAPP_COMMUNITY_LINK;
  if (year === "1st Year" && process.env.WHATSAPP_1ST_YEAR_LINK) {
    whatsappLink = process.env.WHATSAPP_1ST_YEAR_LINK;
  } else if (year === "2nd Year" && process.env.WHATSAPP_2ND_YEAR_LINK) {
    whatsappLink = process.env.WHATSAPP_2ND_YEAR_LINK;
  }

  const instagramLink = process.env.INSTAGRAM_URL;
  const youtubeLink = process.env.YOUTUBE_URL;

  // Header image from .env
  const headerImageUrl = process.env.EMAIL_HEADER_IMAGE_URL;

  // Validate environment variables
  if (!whatsappLink) {
    throw new Error("WHATSAPP_COMMUNITY_LINK is not set in .env");
  }
  if (!instagramLink) {
    throw new Error("INSTAGRAM_URL is not set in .env");
  }
  if (!youtubeLink) {
    throw new Error("YOUTUBE_URL is not set in .env");
  }
  if (!headerImageUrl) {
    throw new Error("EMAIL_HEADER_IMAGE_URL is not set in .env");
  }

  // Clean, standard light email layout
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="
        margin: 0;
        padding: 20px 10px;
        background-color: #f4f5f7;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #333333;
        -webkit-font-smoothing: antialiased;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        ">
          <!-- HEADER IMAGE -->
          <div style="width: 100%; margin: 0; padding: 0; line-height: 0;">
            <img
              src="${headerImageUrl}"
              alt="SRKR ACM"
              style="display: block; width: 100%; height: auto; border: 0;"
            />
          </div>

          <!-- MAIN CONTENT -->
          <div style="padding: 32px 28px;">
            <h1 style="
              margin: 0 0 20px;
              font-size: 24px;
              line-height: 1.3;
              color: #111827;
            ">
              Welcome to SRKR ACM!
            </h1>

            <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
              Dear <strong>${name}</strong>,
            </p>

            <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
              Congratulations! Your registration for <strong>SRKR ACM</strong> has been successfully completed. 🎉
            </p>

            <!-- MEMBERSHIP DETAILS LIST (NO TABLE) -->
            <div style="
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-left: 4px solid #0284c7;
              border-radius: 6px;
              padding: 16px 20px;
              margin: 0 0 24px;
            ">
              <h3 style="
                margin: 0 0 12px;
                font-size: 14px;
                color: #0369a1;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">
                Official Membership Details
              </h3>
              <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #475569;">
                <li><strong>ACM Regd. No:</strong> <span style="color: #0284c7; font-weight: 600;">${aceId}</span></li>
                <li><strong>Department:</strong> ${branch}</li>
                <li><strong>Year of Study:</strong> ${year}</li>
                <li><strong>Admission Mode:</strong> ${mode || "Normal"}</li>
                <li><strong>Registration Type:</strong> ${registrationType}</li>
                <li><strong>Payment Mode:</strong> ${payment}</li>
              </ul>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 24px;">
              Your journey starts here. Get ready to <strong>Learn, Build & Grow</strong>. 🚀
            </p>

            <h2 style="margin: 0 0 14px; font-size: 17px; color: #111827;">
              What You’ll Gain
            </h2>

            <ul style="
              margin: 0 0 24px;
              padding-left: 20px;
              color: #4b5563;
              font-size: 14.5px;
              line-height: 1.7;
            ">
              <li style="margin-bottom: 6px;">Hands-on exposure through coding bootcamps & hackathons</li>
              <li style="margin-bottom: 6px;">Practical computing knowledge and real-world tech stacks</li>
              <li style="margin-bottom: 6px;">Teamwork, leadership & peer collaboration opportunities</li>
              <li style="margin-bottom: 6px;">Mentorship from senior developers and alumni network</li>
              <li>Direct access to ACM national & international events</li>
            </ul>

            <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #4b5563;">
              📎 <em>Your official digital membership ID card is attached to this email with a verifiable QR code.</em>
            </p>

            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
              Let’s learn, build, and grow together.
            </p>
          </div>

          <!-- FOOTER -->
          <div style="
            background-color: #f8fafc;
            border-top: 1px solid #e5e7eb;
            padding: 24px 20px;
            text-align: center;
          ">
            <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #4b5563;">
              Stay Connected
            </p>

            <p style="margin: 0 0 16px; font-size: 13px; color: #0284c7;">
              <a href="${whatsappLink}" target="_blank" style="color: #0284c7; text-decoration: underline; margin: 0 8px;">WhatsApp Community</a> |
              <a href="${instagramLink}" target="_blank" style="color: #0284c7; text-decoration: underline; margin: 0 8px;">Instagram</a> |
              <a href="${youtubeLink}" target="_blank" style="color: #0284c7; text-decoration: underline; margin: 0 8px;">YouTube</a>
            </p>

            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              © 2026 SRKR ACM Student Chapter. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send email using Brevo
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "SRKR ACM",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email, name }],
      subject: "Welcome to SRKR ACM - Registration Confirmation",
      htmlContent,
      attachment: attachments,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API Error (${response.status}): ${errText}`);
  }

  // Delete temporary certificate after sending
  if (!existingCertPath && certificatePath && fs.existsSync(certificatePath)) {
    try {
      fs.unlinkSync(certificatePath);
    } catch (error) {
      console.error("Failed to delete temporary certificate:", error.message);
    }
  }

  return true;
};

// Retry email sending
export const sendWelcomeEmailWithRetry = async (payload, attempts = 3) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      await sendWelcomeEmail(payload);
      console.log(`✅ Welcome email sent to ${payload.email}`);
      return true;
    } catch (error) {
      console.error(`❌ Email attempt ${i} failed for ${payload.email}:`, error.message);
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * i));
      }
    }
  }
  return false;
};