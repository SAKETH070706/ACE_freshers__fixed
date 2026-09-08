import dotenv from "dotenv";
import fs from "fs";
import { generateCertificate } from "./certificateService.js";

dotenv.config();

export const sendWelcomeEmail = async ({
  name,
  email,
  phone,
  aceId,
  branch,
  gender,
  year,
  payment,
  goodies,
}) => {
  // Generate certificate
  const certificatePath = await generateCertificate({
    name,
    email,
    phone,
    aceId,
    branch,
    gender,
    year,
    payment,
    goodies,
  });

  // Certificate attachment
  const attachments = [];

  if (certificatePath && fs.existsSync(certificatePath)) {
    attachments.push({
      name: `ACM_Certificate_${aceId || "Membership"}.pdf`,
      content: fs.readFileSync(certificatePath).toString("base64"),
    });
  }

  // Social links from .env
  const whatsappLink = process.env.WHATSAPP_COMMUNITY_LINK;
  const instagramLink = process.env.INSTAGRAM_URL;
  const youtubeLink = process.env.YOUTUBE_URL;

  // Header image from .env
  const headerImageUrl = process.env.EMAIL_HEADER_IMAGE_URL;

  // Social icons from .env
  const whatsappIconUrl = process.env.WHATSAPP_ICON_URL;
  const instagramIconUrl = process.env.INSTAGRAM_ICON_URL;
  const youtubeIconUrl = process.env.YOUTUBE_ICON_URL;

  // Validate environment variables
  if (!whatsappLink) {
    throw new Error(
      "WHATSAPP_COMMUNITY_LINK is not set in .env"
    );
  }

  if (!instagramLink) {
    throw new Error(
      "INSTAGRAM_URL is not set in .env"
    );
  }

  if (!youtubeLink) {
    throw new Error(
      "YOUTUBE_URL is not set in .env"
    );
  }

  if (!headerImageUrl) {
    throw new Error(
      "EMAIL_HEADER_IMAGE_URL is not set in .env"
    );
  }

  if (!whatsappIconUrl) {
    throw new Error(
      "WHATSAPP_ICON_URL is not set in .env"
    );
  }

  if (!instagramIconUrl) {
    throw new Error(
      "INSTAGRAM_ICON_URL is not set in .env"
    );
  }

  if (!youtubeIconUrl) {
    throw new Error(
      "YOUTUBE_ICON_URL is not set in .env"
    );
  }

  // Email HTML
  const htmlContent = `
    <div style="
      margin: 0;
      padding: 25px 12px;
      background-color: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
      color: #333333;
    ">

      <div style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
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
        <div style="
          padding: 30px 25px;
        ">

          <h1 style="
            margin: 0 0 20px;
            font-size: 28px;
            line-height: 1.2;
            color: #222222;
          ">
            Welcome to SRKR ACM!
          </h1>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
            margin: 0 0 18px;
          ">
            Dear
            <strong style="color: #222222;">
              ${name}
            </strong>,
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
            margin: 0 0 18px;
          ">
            Congratulations! Your registration for
            <strong style="color: #222222;">
              SRKR ACM
            </strong>
            has been successfully completed. 🎉
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
            margin: 0 0 28px;
          ">
            Your journey starts here. Get ready to
            <strong style="color: #222222;">
              Learn, Build & Grow.
            </strong>
            🚀
          </p>

          <!-- WHAT YOU'LL GAIN -->
          <h2 style="
            margin: 0 0 18px;
            font-size: 22px;
            color: #222222;
          ">
            What You’ll Gain
          </h2>

          <ul style="
            margin: 0 0 30px;
            padding-left: 22px;
            color: #333333;
            font-size: 15px;
            line-height: 1.8;
          ">

            <li style="
              margin-bottom: 8px;
            ">
              Hands-on exposure 
            </li>

            <li style="
              margin-bottom: 8px;
            ">
              Practical knowledge
            </li>

            <li style="
              margin-bottom: 8px;
            ">
              Teamwork & collaboration 
            </li>

            <li style="
              margin-bottom: 8px;
            ">
              Problem-solving skills 
            </li>

            <li>
              Opportunities to learn 
            </li>

          </ul>

          <!-- CERTIFICATE NOTE -->
          <p style="
            margin: 0 0 20px;
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
          ">
            Your official digital membership certificate is attached to this
            email. It contains your membership details along with a
            <strong style="color: #222222;">
              verifiable QR code
            </strong>.
          </p>

          <!-- CLOSING -->
          <p style="
            margin: 0 0 18px;
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
          ">
            We’re excited to have you as part of
            <strong style="color: #222222;">
              SRKR ACM!
            </strong>
            ✨
          </p>

          <p style="
            margin: 0;
            font-size: 15px;
            line-height: 1.7;
            color: #333333;
          ">
            Let’s learn, build, and grow together.
          </p>

        </div>

        <!-- FOOTER -->
        <div style="
          background-color: #075bbb;
          padding: 15px 20px;
          text-align: center;
        ">

          <p style="
            margin: 0 0 18px;
            padding: 0;
            font-size: 14px;
            line-height: 20px;
            color: #ffffff;
            text-align: center;
          ">
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
            style="
              width: 240px;
              margin: 0 auto 20px;
              border-collapse: collapse;
              border-spacing: 0;
            "
          >
            <tr>

              <!-- WHATSAPP -->
              <td
                align="center"
                valign="middle"
                width="80"
                style="
                  width: 80px;
                  padding: 0;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                <a
                  href="${whatsappLink}"
                  target="_blank"
                  style="
                    display: inline-block;
                    text-decoration: none;
                  "
                >
                  <img
                    src="${whatsappIconUrl}"
                    alt="WhatsApp"
                    width="40"
                    height="40"
                    style="
                      display: block;
                      width: 40px;
                      height: 40px;
                      max-width: 40px;
                      max-height: 40px;
                      border: 0;
                      margin: 0 auto;
                    "
                  />
                </a>
              </td>

              <!-- INSTAGRAM -->
              <td
                align="center"
                valign="middle"
                width="80"
                style="
                  width: 80px;
                  padding: 0;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                <a
                  href="${instagramLink}"
                  target="_blank"
                  style="
                    display: inline-block;
                    text-decoration: none;
                  "
                >
                  <img
                    src="${instagramIconUrl}"
                    alt="Instagram"
                    width="40"
                    height="40"
                    style="
                      display: block;
                      width: 40px;
                      height: 40px;
                      max-width: 40px;
                      max-height: 40px;
                      border: 0;
                      margin: 0 auto;
                    "
                  />
                </a>
              </td>

              <!-- YOUTUBE -->
              <td
                align="center"
                valign="middle"
                width="80"
                style="
                  width: 80px;
                  padding: 0;
                  text-align: center;
                  vertical-align: middle;
                "
              >
                <a
                  href="${youtubeLink}"
                  target="_blank"
                  style="
                    display: inline-block;
                    text-decoration: none;
                  "
                >
                  <img
                    src="${youtubeIconUrl}"
                    alt="YouTube"
                    width="40"
                    height="40"
                    style="
                      display: block;
                      width: 40px;
                      height: 40px;
                      max-width: 40px;
                      max-height: 40px;
                      border: 0;
                      margin: 0 auto;
                    "
                  />
                </a>
              </td>

            </tr>
          </table>

          <p style="
            margin: 0;
            padding: 0;
            font-size: 13px;
            line-height: 20px;
            color: #ffffff;
            text-align: center;
          ">
            © 2026 SRKR ACM
          </p>

        </div>

      </div>

    </div>
  `;

  // Send email using Brevo
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
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

        to: [
          {
            email,
            name,
          },
        ],

        subject:
          "Welcome to SRKR ACM - Registration Confirmation",

        htmlContent,

        attachment: attachments,
      }),
    }
  );

  // Handle Brevo error
  if (!response.ok) {
    const errText = await response.text();

    throw new Error(
      `Brevo API Error (${response.status}): ${errText}`
    );
  }

  // Delete temporary certificate after sending
  if (certificatePath && fs.existsSync(certificatePath)) {
    try {
      fs.unlinkSync(certificatePath);
    } catch (error) {
      console.error(
        "Failed to delete temporary certificate:",
        error.message
      );
    }
  }

  return true;
};

// Retry email sending
export const sendWelcomeEmailWithRetry = async (
  payload,
  attempts = 3
) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      await sendWelcomeEmail(payload);

      console.log(
        `✅ Welcome email sent to ${payload.email}`
      );

      return true;
    } catch (error) {
      console.error(
        `❌ Email attempt ${i} failed for ${payload.email}:`,
        error.message
      );

      if (i < attempts) {
        await new Promise(
          (resolve) => setTimeout(resolve, 1000 * i)
        );
      }
    }
  }

  return false;
};