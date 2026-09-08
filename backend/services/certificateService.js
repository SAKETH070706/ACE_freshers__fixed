import fs from "fs/promises";
import path from "path";
import os from "os";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Automatically detect local machine Wi-Fi IPv4 address for mobile QR scanning
const getLocalNetworkIp = () => {
    try {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {
                if (net.family === "IPv4" && !net.internal) {
                    return net.address;
                }
            }
        }
    } catch {
        // Fallback
    }
    return "localhost";
};

export const generateCertificate = async ({
    name,
    email,
    phone,
    aceId,
    branch,
    gender,
    year,
    mode = "Normal",
    registrationType = "ACM India",
    payment,
    goodies,
}) => {
    // 1. Determine verification URL
    // Priority:
    // a. Explicit VERIFICATION_BASE_URL
    // b. Render auto-injected RENDER_EXTERNAL_URL (e.g. https://service.onrender.com)
    // c. Railway auto-injected RAILWAY_PUBLIC_DOMAIN
    // d. BACKEND_URL
    // e. Local machine Wi-Fi IPv4 fallback for local development
    let baseUrl =
        process.env.VERIFICATION_BASE_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
        process.env.BACKEND_URL;

    if (!baseUrl || baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
        const localIp = getLocalNetworkIp();
        const port = process.env.PORT || 5000;
        baseUrl = `http://${localIp}:${port}`;
    }

    // Clean trailing slashes
    baseUrl = baseUrl.trim().replace(/\/+$/, "");
    const verificationUrl = `${baseUrl}/verify/${aceId}`;
    console.log(`[Certificate] Encoded QR verification URL: ${verificationUrl}`);

    // 2. Read template background image
    const templatePath = path.join(process.cwd(), "templates", "acm_id_card_bg.png");
    const templateBytes = await fs.readFile(templatePath);

    // 3. Generate high-resolution QR code PNG buffer (styled in dark navy #022e6e to match template theme)
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
            dark: "#022e6e",
            light: "#ffffff",
        },
    });

    // 4. Create PDF Document matching the exact dimensions of the template (1024 x 645)
    const pdfDoc = await PDFDocument.create();
    const bgImage = await pdfDoc.embedPng(templateBytes);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    const pageWidth = bgImage.width; // 1024
    const pageHeight = bgImage.height; // 645
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw Background Template
    page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
    });

    // 5. Draw QR Code centered inside the left designated rounded box
    // Blue frame: X=[68, 245], width=177 | Y=[222, 403], height=181
    // Box center: X=156.5, Y=312.5. With qrSize=156, padding is ~10.5px on all sides.
    const qrSize = 156;
    const qrX = 78.5;
    const qrY = 234.5;

    page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
    });

    // 6. Fonts and Typography
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Exact Dark Navy text color matching template typography (#022e6e)
    const textColor = rgb(2 / 255, 46 / 255, 110 / 255);
    const startX = 535; // Colons end at X=515; 20px clean margin

    // Row 1: Name (Colon center PDF Y = 322.5)
    const cleanName = String(name || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    let nameFontSize = 18;
    if (cleanName.length > 28) nameFontSize = 13;
    else if (cleanName.length > 20) nameFontSize = 15;
    const nameY = 322.5 - (0.359 * nameFontSize);

    page.drawText(cleanName, {
        x: startX,
        y: nameY,
        size: nameFontSize,
        font: boldFont,
        color: textColor,
    });

    // Row 2: ACM Regd. No. (Colon center PDF Y = 269)
    const cleanRegNo = String(aceId || "N/A").trim();
    const regFontSize = 18;
    const regY = 269 - (0.359 * regFontSize);

    page.drawText(cleanRegNo, {
        x: startX,
        y: regY,
        size: regFontSize,
        font: boldFont,
        color: textColor,
    });

    // Row 3: Department (Colon center PDF Y = 216)
    const isLateral = String(mode || "").toLowerCase() === "lateral";
    const deptInfo = `${branch || ""}${isLateral ? " (Lateral)" : ""}`.trim();
    let deptFontSize = 16;
    if (deptInfo.length > 36) deptFontSize = 11.5;
    else if (deptInfo.length > 28) deptFontSize = 13.5;
    else if (deptInfo.length > 22) deptFontSize = 14.5;
    const deptY = 216 - (0.359 * deptFontSize);

    page.drawText(deptInfo, {
        x: startX,
        y: deptY,
        size: deptFontSize,
        font: boldFont,
        color: textColor,
    });

    // 7. Save and Return Output Path
    const pdfBytes = await pdfDoc.save();

    const generatedDir = path.join(process.cwd(), "generated");
    await fs.mkdir(generatedDir, { recursive: true });

    const outputPath = path.join(
        generatedDir,
        `ACM_Certificate_${String(aceId || "Membership").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
    );

    await fs.writeFile(outputPath, pdfBytes);

    return outputPath;
};

export const cleanupCertificate = async (filePath) => {
    try {
        if (filePath) {
            await fs.unlink(filePath).catch(() => {});
        }
    } catch (e) {
        console.warn(`Failed to cleanup certificate ${filePath}:`, e.message);
    }
};
