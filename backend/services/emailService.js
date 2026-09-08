import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createOneTimeLink } from "./oneTimeLinkService.js";

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
  registrationType = "ACM India",
  certificatePath = null,
}) => {
  const attachments = [];

  // Add certificate PDF attachment
  if (certificatePath && fs.existsSync(certificatePath)) {
    attachments.push({
      name: `ACM_Certificate_${aceId || "Membership"}.pdf`,
      content: fs.readFileSync(certificatePath).toString("base64"),
    });
  }

  // 2. Select year group target link
  const is2ndYear = String(year || "").includes("2nd Year");
  const yearLabel = is2ndYear ? (String(year).includes("L.E") ? "2nd Year L.E" : "2nd Year") : "1st Year";
  const groupTargetUrl = is2ndYear
    ? process.env.WHATSAPP_2ND_YEAR_LINK
    : process.env.WHATSAPP_1ST_YEAR_LINK;

  if (!groupTargetUrl) {
    throw new Error(
      `${is2ndYear ? "WHATSAPP_2ND_YEAR_LINK" : "WHATSAPP_1ST_YEAR_LINK"} is not set.`
    );
  }

  const whatsappLink = await createOneTimeLink(groupTargetUrl);

  // 3. Build HTML content
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; background-color: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px; padding: 24px 16px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 12px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;">ACM</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.92; font-weight: 500;">Association for Computing Machinery • SRKR Engineering College</p>
      </div>

      <div style="margin-bottom: 24px; padding: 20px; background-color: #f0f7ff; border-radius: 12px; border-left: 5px solid #2563eb;">
        <h2 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 22px;">Welcome to ACM, ${name}! 🎉</h2>
        <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6;">
          Congratulations! You have officially become a recognized member of the <strong>Association for Computing Machinery (ACM)</strong>.
          Your registration details are listed below, and your official membership certificate is attached.
        </p>
      </div>

      <div style="margin-bottom: 24px; padding: 20px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center;">
        <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 18px;">📱 Join the Official ${yearLabel} WhatsApp Group</h3>
        <p style="color: #15803d; font-size: 14px; margin: 0 0 14px 0; line-height: 1.5;">
          Stay updated with official ACM announcements and event schedules!
        </p>
        <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 24px; border-radius: 30px;">
          Join ${yearLabel} WhatsApp Group →
        </a>
      </div>

      <h3 style="color: #1e3a8a; margin-top: 24px; margin-bottom: 14px; font-size: 16px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        📋 Your Official Dossier
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Member ID</td><td style="font-weight: 700; color: #2563eb;">${aceId}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Full Name</td><td style="font-weight: 600;">${name}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Email Address</td><td>${email}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Phone Number</td><td>${phone}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Department</td><td>${branch}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Year of Study</td><td>${year}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Type of Registration</td><td style="font-weight: 600; color: #2563eb;">${registrationType || "ACM India"}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Payment Mode</td><td>${payment}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Goodies Selected</td><td>${goodies}</td></tr>
      </table>
    </div>
  `;

  // 4. Send directly via Brevo REST API (HTTPS port 443)
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "ACM Student Chapter", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email, name }],
      subject: "🎉 Official Member of ACM - Certificate & Registration Confirmation",
      htmlContent,
      attachment: attachments,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API Error (${response.status}): ${errText}`);
  }

  return true;
};

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