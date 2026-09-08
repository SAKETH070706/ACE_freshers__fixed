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
import dotenv from "dotenv";
import fs from "fs";
import { generateCertificate } from "./certificateService.js";

dotenv.config();

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

    // Delete temporary PDF immediately after converting to email attachment buffer
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

  // Header image and icons from .env
  const headerImageUrl = process.env.EMAIL_HEADER_IMAGE_URL;
  const whatsappIconUrl = process.env.WHATSAPP_ICON_URL;
  const instagramIconUrl = process.env.INSTAGRAM_ICON_URL;
  const youtubeIconUrl = process.env.YOUTUBE_ICON_URL;

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
  if (!whatsappIconUrl) {
    throw new Error("WHATSAPP_ICON_URL is not set in .env");
  }
  if (!instagramIconUrl) {
    throw new Error("INSTAGRAM_ICON_URL is not set in .env");
  }
  if (!youtubeIconUrl) {
    throw new Error("YOUTUBE_ICON_URL is not set in .env");
  }

  // Email HTML
  const htmlContent = `
    <div style="
      margin: 0;
      padding: 25px 12px;
      background-color: #111118;
      font-family: Arial, Helvetica, sans-serif;
      color: #f5f5f5;
    ">
      <div style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #17171f;
        border-radius: 14px;
        overflow: hidden;
      ">
        <!-- HEADER IMAGE -->
        <div style="
          width: 100%;
          margin: 0;
          padding: 0;
          line-height: 0;
        ">
          <img
            src="${headerImageUrl}"
            alt="SRKR ACM"
            style="
              display: block;
              width: 100%;
              height: auto;
              margin: 0;
              padding: 0;
              border: 0;
            "
          />
        </div>

        <!-- MAIN CONTENT -->
        <div style="padding: 30px 25px;">
          <h1 style="
            margin: 0 0 20px;
            font-size: 28px;
            line-height: 1.2;
            color: #ffffff;
          ">
            Welcome to SRKR ACM!
          </h1>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #dddddf;
            margin: 0 0 18px;
          ">
            Dear <strong style="color: #ffffff;">${name}</strong>,
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #dddddf;
            margin: 0 0 18px;
          ">
            Congratulations! Your registration for <strong style="color: #ffffff;">SRKR ACM</strong> has been successfully completed. 🎉
          </p>

          <!-- REGISTRATION DOSSIER CARD -->
          <div style="
            background-color: #0b1120;
            border: 1px solid #1e3a8a;
            border-radius: 12px;
            padding: 18px 20px;
            margin: 0 0 24px;
          ">
            <h3 style="
              margin: 0 0 14px;
              font-size: 15px;
              color: #60a5fa;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              border-bottom: 1px solid #1e293b;
              padding-bottom: 8px;
            ">
              Official Membership Details
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">ACM Regd. No.</td>
                <td style="padding: 6px 0; color: #60a5fa; font-weight: bold; text-align: right;">${aceId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Department</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${branch}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Year of Study</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${year}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Admission Mode</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${mode || "Normal"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Type of Registration</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${registrationType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Payment Mode</td>
                <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${payment}</td>
              </tr>
            </table>
          </div>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #dddddf;
            margin: 0 0 28px;
          ">
            Your journey starts here. Get ready to <strong style="color: #ffffff;">Learn, Build & Grow.</strong> 🚀
          </p>

          <!-- WHAT YOU'LL GAIN -->
          <h2 style="margin: 0 0 18px; font-size: 20px; color: #ffffff;">
            What You’ll Gain
          </h2>

          <ul style="
            margin: 0 0 30px;
            padding-left: 22px;
            color: #dddddf;
            font-size: 14.5px;
            line-height: 1.8;
          ">
            <li style="margin-bottom: 8px;">Hands-on exposure through coding bootcamps & hackathons</li>
            <li style="margin-bottom: 8px;">Practical computing knowledge and real-world tech stacks</li>
            <li style="margin-bottom: 8px;">Teamwork, leadership & peer collaboration opportunities</li>
            <li style="margin-bottom: 8px;">Mentorship from senior developers and alumni network</li>
            <li>Direct access to ACM national & international events</li>
          </ul>

          <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7; color: #dddddf;">
            Your official digital membership ID card is attached to this email with a verifiable QR code.
          </p>

          <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #dddddf;">
            Let’s learn, build, and grow together.
          </p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #075bbb; padding: 25px 20px; text-align: center;">
          <p style="margin: 0 0 18px; padding: 0; font-size: 14px; line-height: 20px; color: #ffffff;">
            Stay Connected With Us
          </p>

          <!-- SOCIAL ICONS -->
          <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="240"
            align="center"
            style="width: 240px; margin: 0 auto 20px; border-collapse: collapse; border-spacing: 0;"
          >
            <tr>
              <td align="center" valign="middle" width="80" style="width: 80px; padding: 0; text-align: center;">
                <a href="${whatsappLink}" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="${whatsappIconUrl}" alt="WhatsApp" width="40" height="40" style="display: block; width: 40px; height: 40px; border: 0; margin: 0 auto;" />
                </a>
              </td>
              <td align="center" valign="middle" width="80" style="width: 80px; padding: 0; text-align: center;">
                <a href="${instagramLink}" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="${instagramIconUrl}" alt="Instagram" width="40" height="40" style="display: block; width: 40px; height: 40px; border: 0; margin: 0 auto;" />
                </a>
              </td>
              <td align="center" valign="middle" width="80" style="width: 80px; padding: 0; text-align: center;">
                <a href="${youtubeLink}" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="${youtubeIconUrl}" alt="YouTube" width="40" height="40" style="display: block; width: 40px; height: 40px; border: 0; margin: 0 auto;" />
                </a>
              </td>
            </tr>
          </table>

          <p style="margin: 0; padding: 0; font-size: 13px; line-height: 20px; color: #ffffff; text-align: center;">
            © 2026 SRKR ACM Student Chapter
          </p>
        </div>
      </div>
    </div>
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

  // Delete temporary certificate after sending (only if newly generated here)
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
