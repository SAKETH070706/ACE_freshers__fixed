import fs from "fs/promises";
import path from "path";

import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";


import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Asset Path (resolved relative to backend directory)
// ============================================================

const getAssetPath = (...paths) => {
    return path.resolve(
        __dirname,
        "..",
        ...paths
    );
};


// ============================================================
// Color
// ============================================================

const textColor = rgb(
    0.10,
    0.10,
    0.10
);


// ============================================================
// Draw centered text
// ============================================================

const drawCenteredText = (
    page,
    text,
    font,
    size,
    y,
    color = textColor
) => {

    const pageWidth = page.getWidth();

    const textWidth =
        font.widthOfTextAtSize(
            text,
            size
        );

    const x =
        (pageWidth - textWidth) / 2;

    page.drawText(
        text,
        {
            x,
            y,
            size,
            font,
            color,
        }
    );
};


// ============================================================
// Draw label + value
// ============================================================

const drawLabelValue = (
    page,
    label,
    value,
    x,
    y,
    labelFont,
    valueFont,
    options = {}
) => {

    const labelSize =
        options.labelSize || 15;

    const valueSize =
        options.valueSize || 15;

    const color =
        options.color || textColor;

    const gap =
        options.gap || 8;


    const labelText =
        `${label}:`;


    page.drawText(
        labelText,
        {
            x,
            y,
            size: labelSize,
            font: labelFont,
            color,
        }
    );


    const labelWidth =
        labelFont.widthOfTextAtSize(
            labelText,
            labelSize
        );


    let finalValueSize =
        valueSize;


    const maxWidth =
        options.maxWidth || 900;


    const availableWidth =
        maxWidth -
        labelWidth -
        gap;


    while (
        finalValueSize > 10 &&
        valueFont.widthOfTextAtSize(
            String(value ?? ""),
            finalValueSize
        ) > availableWidth
    ) {

        finalValueSize--;
    }


    page.drawText(
        String(value ?? ""),
        {
            x:
                x +
                labelWidth +
                gap,

            y,

            size:
                finalValueSize,

            font:
                valueFont,

            color,
        }
    );
};


// ============================================================
// Draw signature + label
// ============================================================

const drawSignatureBlock = (
    page,
    signature,
    centerX,
    imageY,
    signatureWidth,
    label,
    font
) => {

    const scale =
        signatureWidth /
        signature.width;


    const signatureHeight =
        signature.height *
        scale;


    const imageX =
        centerX -
        signatureWidth / 2;


    // Signature
    page.drawImage(
        signature,
        {
            x: imageX,
            y: imageY,
            width: signatureWidth,
            height: signatureHeight,
        }
    );


    // Label below signature
    const labelSize = 14;

    const labelWidth =
        font.widthOfTextAtSize(
            label,
            labelSize
        );


    page.drawText(
        label,
        {
            x:
                centerX -
                labelWidth / 2,

            y:
                imageY -
                35,

            size:
                labelSize,

            font,
            color: textColor,
        }
    );
};


// In-memory cache for static template and signature image assets
let cachedAssets = null;

const loadCertificateAssets = async () => {
    if (cachedAssets) {
        return cachedAssets;
    }

    const templatePath =
        getAssetPath(
            "templates",
            "certificate-bg.jpg"
        );

    const hodSignaturePath =
        getAssetPath(
            "signatures",
            "hod_sign.png"
        );

    const secretarySignaturePath =
        getAssetPath(
            "signatures",
            "sec_sign.png"
        );

    const [
        templateBytes,
        hodSignatureBytes,
        secretarySignatureBytes,
    ] = await Promise.all([
        fs.readFile(templatePath),
        fs.readFile(hodSignaturePath),
        fs.readFile(secretarySignaturePath),
    ]);

    cachedAssets = {
        templateBytes,
        hodSignatureBytes,
        secretarySignatureBytes,
    };

    return cachedAssets;
};

// Sanitize string to WinAnsi supported characters so pdf-lib never throws
const sanitizeWinAnsi = (str) => {
    if (!str) return "";
    return String(str)
        .normalize("NFKD")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
        .trim();
};


// ============================================================
// Generate Certificate
// ============================================================

export const generateCertificate = async ({
    name,
    email,
    phone,
    aceId,
    branch,
    gender,
    year,
    registrationType = "ACM India",
    payment,
    goodies,
}) => {
    // Sanitize user inputs for WinAnsi standard font
    const cleanName = sanitizeWinAnsi(name);
    const cleanEmail = sanitizeWinAnsi(email);
    const cleanPhone = sanitizeWinAnsi(phone);
    const cleanAceId = sanitizeWinAnsi(aceId);
    const cleanBranch = sanitizeWinAnsi(branch);
    const cleanGender = sanitizeWinAnsi(gender);
    const cleanYear = sanitizeWinAnsi(year);
    const cleanRegType = sanitizeWinAnsi(registrationType || "ACM India");
    const cleanPayment = sanitizeWinAnsi(payment);
    const cleanGoodies = sanitizeWinAnsi(goodies);

    // ========================================================
    // 1. Read cached assets
    // ========================================================

    const {
        templateBytes,
        hodSignatureBytes,
        secretarySignatureBytes,
    } = await loadCertificateAssets();


    // ========================================================
    // 3. Create PDF
    // ========================================================

    const pdfDoc =
        await PDFDocument.create();


    const background =
        await pdfDoc.embedJpg(
            templateBytes
        );


    const page =
        pdfDoc.addPage([
            background.width,
            background.height,
        ]);


    // ========================================================
    // 4. Draw official background
    // ========================================================

    page.drawImage(
        background,
        {
            x: 0,
            y: 0,

            width:
                background.width,

            height:
                background.height,
        }
    );


    // ========================================================
    // 5. Fonts
    // ========================================================

    const regularFont =
        await pdfDoc.embedFont(
            StandardFonts.Helvetica
        );


    const boldFont =
        await pdfDoc.embedFont(
            StandardFonts.HelveticaBold
        );


    // ========================================================
    // 6. Certificate title
    // ========================================================

    drawCenteredText(
        page,

        "ENROLLMENT CONFIRMATION",

        boldFont,

        28,

        1535
    );


    // ========================================================
    // 7. Greeting
    // ========================================================

    page.drawText(
        `Dear ${cleanName},`,
        {
            x: 150,

            y: 1435,

            size: 17,

            font:
                regularFont,

            color:
                textColor,
        }
    );


    // ========================================================
    // 8. Formal paragraph
    // ========================================================

    const paragraphLines = [

        "This is to certify that the above-named individual has been",

        "officially enrolled as a member of the Association for",

        "Computing Machinery (ACM), Department of Computer",

        "Science and Engineering.",

    ];


    let paragraphY = 1390;


    for (
        const line
        of paragraphLines
    ) {

        drawCenteredText(
            page,

            line,

            regularFont,

            15,

            paragraphY
        );


        paragraphY -= 25;
    }


    // ========================================================
    // 9. Submitted Details heading
    // ========================================================

    drawCenteredText(
        page,

        "SUBMITTED DETAILS",

        boldFont,

        20,

        1240
    );


    // ========================================================
    // 10. Single-column participant details with clear font hierarchy
    // ========================================================

    const detailsX = 180;
    const detailsGap = 52;
    let detailsY = 1175;

    // ACM Reg. No (KEY FIELD - BIG & BOLD)
    drawLabelValue(
        page,
        "ACM Reg. No",
        cleanAceId,
        detailsX,
        detailsY,
        boldFont,
        boldFont,
        {
            labelSize: 20,
            valueSize: 22,
        }
    );

    detailsY -= detailsGap;

    // Name (KEY FIELD - BIG & BOLD)
    drawLabelValue(
        page,
        "Name",
        cleanName,
        detailsX,
        detailsY,
        boldFont,
        boldFont,
        {
            labelSize: 20,
            valueSize: 22,
        }
    );

    detailsY -= detailsGap;

    // Department (KEY FIELD - BIG & BOLD)
    drawLabelValue(
        page,
        "Department",
        cleanBranch,
        detailsX,
        detailsY,
        boldFont,
        boldFont,
        {
            labelSize: 19,
            valueSize: 20,
        }
    );

    detailsY -= detailsGap;

    // Year of Study (KEY FIELD - BIG & BOLD)
    drawLabelValue(
        page,
        "Year of Study",
        cleanYear,
        detailsX,
        detailsY,
        boldFont,
        boldFont,
        {
            labelSize: 19,
            valueSize: 20,
        }
    );

    detailsY -= detailsGap;

    // Phone Number (Secondary Field)
    drawLabelValue(
        page,
        "Phone Number",
        cleanPhone,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
        }
    );

    detailsY -= detailsGap;

    // Email (Secondary Field)
    drawLabelValue(
        page,
        "Email",
        cleanEmail,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
            maxWidth: 1100,
        }
    );

    detailsY -= detailsGap;

    // Gender (Secondary Field)
    drawLabelValue(
        page,
        "Gender",
        cleanGender,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
        }
    );

    detailsY -= detailsGap;

    // Goodies (Secondary Field)
    drawLabelValue(
        page,
        "Goodies",
        cleanGoodies,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
        }
    );

    detailsY -= detailsGap;

    // Payment Mode (Secondary Field)
    drawLabelValue(
        page,
        "Payment Mode",
        cleanPayment,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
        }
    );

    detailsY -= detailsGap;

    // Type of Registration (Secondary Field)
    drawLabelValue(
        page,
        "Type of Registration",
        cleanRegType,
        detailsX,
        detailsY,
        boldFont,
        regularFont,
        {
            labelSize: 16,
            valueSize: 16,
        }
    );


    // ========================================================
    // 11. Embed signatures
    // ========================================================

    const hodSignature =
        await pdfDoc.embedPng(
            hodSignatureBytes
        );


    const secretarySignature =
        await pdfDoc.embedPng(
            secretarySignatureBytes
        );


    // ========================================================
    // 12. Signature blocks
    // ========================================================

    const signatureWidth = 180;

    const signatureY = 390;


    // HOD
    drawSignatureBlock(
        page,

        hodSignature,

        300,

        signatureY,

        signatureWidth,

        "Head of CSE Department",

        boldFont
    );


    // ACM Secretary
    drawSignatureBlock(
        page,

        secretarySignature,

        1110,

        signatureY,

        signatureWidth,

        "ACM Secretary",

        boldFont
    );


    // ========================================================
    // 13. Generate PDF bytes
    // ========================================================

    const pdfBytes =
        await pdfDoc.save();


    // ========================================================
    // 14. Temporary generated folder
    // ========================================================

    const generatedDir =
        getAssetPath(
            "generated"
        );


    await fs.mkdir(
        generatedDir,
        {
            recursive: true,
        }
    );


    // ========================================================
    // 15. Safe filename
    // ========================================================

    const safeName =
        String(name)

            .normalize("NFKD")

            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                ""
            )

            .trim()

            ||
            "participant";


    const safeAceId =
        String(aceId || "ACE")

            .replace(
                /[^a-zA-Z0-9_-]/g,
                ""
            );


    const outputPath =
        path.join(
            generatedDir,

            `${safeAceId}-${safeName}.pdf`
        );


    // ========================================================
    // 16. Save PDF
    // ========================================================

    await fs.writeFile(
        outputPath,
        pdfBytes
    );


    console.log(
        `Certificate generated: ${outputPath}`
    );


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