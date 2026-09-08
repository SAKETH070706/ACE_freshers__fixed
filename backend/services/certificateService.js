import fs from "fs/promises";
import path from "path";

import {
    PDFDocument,
    StandardFonts,
    rgb,
} from "pdf-lib";


// ============================================================
// Asset Path
// ============================================================

const getAssetPath = (...paths) => {
    return path.join(
        process.cwd(),
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

    // ========================================================
    // 1. Asset paths
    // ========================================================

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


    // ========================================================
    // 2. Read assets
    // ========================================================

    const [
        templateBytes,
        hodSignatureBytes,
        secretarySignatureBytes,
    ] = await Promise.all([
        fs.readFile(
            templatePath
        ),

        fs.readFile(
            hodSignaturePath
        ),

        fs.readFile(
            secretarySignaturePath
        ),
    ]);


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
        `Dear ${name},`,
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
        aceId,
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
        name,
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
        branch,
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
        year,
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
        phone,
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
        email,
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
        gender,
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
        goodies,
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
        payment,
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
        registrationType || "ACM India",
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