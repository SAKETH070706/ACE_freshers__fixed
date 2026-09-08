import Registration from "../models/Registration.js";

// Format name into Title Case: "gopala krishna saketh" -> "Gopala Krishna Saketh"
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

export const verifyCertificate = async (req, res) => {
    try {
        const { aceId } = req.params;

        if (!aceId) {
            return res.status(400).send(renderInvalidPage("No Member ID provided."));
        }

        const cleanAceId = String(aceId).trim();
        const registration = await Registration.findOne({ aceId: cleanAceId });

        if (!registration) {
            return res.status(404).send(
                renderInvalidPage(`Membership ID "<strong>${cleanAceId}</strong>" was not found in our records.`)
            );
        }

        const registrationDate = registration.registeredAt
            ? new Date(registration.registeredAt)
            : new Date(registration.createdAt || Date.now());

        // Validity: 4 Years for Local Body Chapter, 1 Year for ACM India
        const regType = String(registration.registrationType || "").trim().toLowerCase();
        const isLocalChapter = regType.includes("local");
        const validityYears = isLocalChapter ? 4 : 1;

        const validUntil = new Date(registrationDate);
        validUntil.setFullYear(validUntil.getFullYear() + validityYears);

        const now = new Date();
        const isValid = now <= validUntil;

        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.max(0, Math.ceil((validUntil - now) / msPerDay));
        const daysExpired = Math.max(0, Math.ceil((now - validUntil) / msPerDay));

        // Format Date: e.g. "8 Sept 2026"
        const formatDate = (d) => {
            const day = d.getDate();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        };

        const html = renderVerificationPage({
            aceId: registration.aceId,
            name: formatTitleCase(registration.name),
            branch: registration.branch,
            year: registration.year,
            mode: registration.mode || "Normal",
            registrationType: registration.registrationType || (isLocalChapter ? "Local Body Chapter" : "ACM India"),
            registrationDate: formatDate(registrationDate),
            validUntil: formatDate(validUntil),
            isValid,
            validityYears,
            daysRemaining,
            daysExpired,
        });

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
    } catch (error) {
        console.error("Verification error:", error.message);
        return res.status(500).send(renderInvalidPage("Server error while verifying certificate."));
    }
};

const renderInvalidPage = (message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invalid Membership | ACM SRKR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #fee2e2;
      border-radius: 20px;
      max-width: 440px;
      width: 100%;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      margin: 0 auto 16px;
    }
    h1 { color: #b91c1c; font-size: 20px; margin-bottom: 10px; font-weight: 700; }
    p { color: #64748b; font-size: 14.5px; line-height: 1.6; }
    .footer { margin-top: 24px; font-size: 12.5px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <h1>Certificate Not Verified</h1>
    <p>${message}</p>
    <div class="footer">Association for Computing Machinery • SRKR Engineering College</div>
  </div>
</body>
</html>
`;

const renderVerificationPage = ({
    aceId,
    name,
    branch,
    year,
    mode,
    registrationType,
    registrationDate,
    validUntil,
    isValid,
    validityYears,
    daysRemaining,
    daysExpired,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Student Membership | ${aceId} | ACM SRKR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      -webkit-font-smoothing: antialiased;
    }

    /* TOP NAVBAR */
    .top-navbar {
      width: 100%;
      background: #ffffff;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-diamond {
      width: 38px;
      height: 38px;
      flex-shrink: 0;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 14.5px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.2px;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      margin-top: 3px;
    }
    .menu-icon {
      width: 26px;
      height: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
    }
    .menu-icon span {
      display: block;
      height: 3px;
      width: 100%;
      background: #005ca9;
      border-radius: 4px;
    }

    /* BLUE HERO HEADER */
    .hero-banner {
      width: 100%;
      background: #005ca9;
      background: linear-gradient(180deg, #015ba7 0%, #004d91 100%);
      padding: 26px 20px 54px;
      text-align: center;
      color: #ffffff;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin: 0;
    }
    .hero-subtitle {
      font-size: 13.5px;
      font-weight: 500;
      opacity: 0.9;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }

    /* MAIN FLOATING CARD */
    .card-container {
      width: 100%;
      max-width: 440px;
      padding: 0 16px;
      margin-top: -36px;
      margin-bottom: 24px;
    }
    .member-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
      border: 1px solid #f1f5f9;
    }

    /* STATUS BADGE BOX */
    .status-box {
      background: #eff6ff;
      border-radius: 16px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .status-check-circle {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: ${isValid ? "#22c55e" : "#ef4444"};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px ${isValid ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"};
    }
    .status-check-circle svg {
      width: 24px;
      height: 24px;
      stroke: #ffffff;
      stroke-width: 3.2;
      fill: none;
    }
    .status-info {
      display: flex;
      flex-direction: column;
    }
    .status-caption {
      font-size: 11px;
      font-weight: 800;
      color: #005ca9;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .status-state {
      font-size: 26px;
      font-weight: 800;
      color: ${isValid ? "#005ca9" : "#dc2626"};
      line-height: 1.15;
      margin: 2px 0 4px;
    }
    .status-sub {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.35;
    }

    /* DETAILS LIST */
    .details-list {
      margin-top: 14px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .detail-value.blue {
      color: #005ca9;
      font-weight: 800;
    }

    /* COUNTDOWN / VALIDITY PILL */
    .validity-pill {
      background: #eff6ff;
      border-radius: 14px;
      padding: 14px 18px;
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .calendar-icon-wrap {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .calendar-icon-wrap svg {
      width: 24px;
      height: 24px;
      stroke: #005ca9;
      stroke-width: 2.2;
      fill: none;
    }
    .pill-divider {
      width: 1px;
      height: 32px;
      background: #cbd5e1;
      flex-shrink: 0;
    }
    .pill-text {
      display: flex;
      flex-direction: column;
    }
    .pill-top {
      font-size: 14px;
      font-weight: 800;
      color: #005ca9;
    }
    .pill-bottom {
      font-size: 12.5px;
      color: #64748b;
      margin-top: 1px;
    }

    /* FOOTER */
    .page-footer {
      width: 100%;
      max-width: 440px;
      padding: 0 20px 32px;
      text-align: center;
      font-size: 12.5px;
      color: #94a3b8;
    }
    .footer-links {
      margin-top: 6px;
    }
    .footer-links a {
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      margin: 0 8px;
    }
  </style>
</head>
<body>

  <!-- TOP NAVBAR -->
  <header class="top-navbar">
    <div class="brand-left">
      <!-- ACM DIAMOND LOGO -->
      <svg class="logo-diamond" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="7" width="60.8" height="60.8" rx="8" transform="rotate(45 50 7)" fill="#005ca9" />
        <rect x="50" y="17" width="46.6" height="46.6" rx="5" transform="rotate(45 50 17)" fill="#ffffff" />
        <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="23" font-weight="900" fill="#005ca9" text-anchor="middle" letter-spacing="-1">acm</text>
      </svg>
      <div class="brand-text">
        <div class="brand-title">Association for<br/>Computing Machinery</div>
        <div class="brand-subtitle">Department of CSE • SRKR Engineering College</div>
      </div>
    </div>
    <div class="menu-icon">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>

  <!-- BLUE HERO BANNER -->
  <section class="hero-banner">
    <h1 class="hero-title">Student Membership</h1>
    <p class="hero-subtitle">Learn &nbsp;•&nbsp; Connect &nbsp;•&nbsp; Grow</p>
  </section>

  <!-- FLOATING CARD -->
  <main class="card-container">
    <div class="member-card">
      
      <!-- MEMBERSHIP STATUS BOX -->
      <div class="status-box">
        <div class="status-check-circle">
          ${
            isValid
              ? `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`
              : `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
          }
        </div>
        <div class="status-info">
          <span class="status-caption">MEMBERSHIP STATUS</span>
          <span class="status-state">${isValid ? "Valid" : "Expired"}</span>
          <span class="status-sub">${isValid ? "Verified Authentic Active Member" : "Membership Term Completed"}</span>
          <span class="status-sub">${isValid ? `Valid for ${validityYears} Year${validityYears > 1 ? "s" : ""}` : "Please renew to reactivate"}</span>
        </div>
      </div>

      <!-- DETAILS TABLE -->
      <div class="details-list">
        <div class="detail-row">
          <span class="detail-label">ACM Member ID</span>
          <span class="detail-value blue">${aceId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Member Name</span>
          <span class="detail-value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Department</span>
          <span class="detail-value">${branch}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Year of Study</span>
          <span class="detail-value">${year}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Admission Mode</span>
          <span class="detail-value">${mode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registration Type</span>
          <span class="detail-value">${registrationType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registration Date</span>
          <span class="detail-value">${registrationDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valid Until</span>
          <span class="detail-value blue">${validUntil}</span>
        </div>
      </div>

      <!-- COUNTDOWN PILL -->
      <div class="validity-pill">
        <div class="calendar-icon-wrap">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="pill-divider"></div>
        <div class="pill-text">
          <span class="pill-top">${isValid ? `${daysRemaining} days remaining` : `Expired ${daysExpired} days ago`}</span>
          <span class="pill-bottom">${isValid ? `in your ${validityYears}-year membership` : "Renew your membership"}</span>
        </div>
      </div>

    </div>
  </main>

  <!-- FOOTER -->
  <footer class="page-footer">
    <div>© 2026 ACM SRKR. All rights reserved.</div>
    <div class="footer-links">
      <a href="#">About</a>
      <span>|</span>
      <a href="#">Support</a>
    </div>
  </footer>

</body>
</html>
`;
