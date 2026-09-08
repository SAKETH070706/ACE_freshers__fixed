# ACE Freshers 2026 Registration Portal (ACM Student Chapter)

Official registration web application for the ACM Student Chapter (Department of Computer Science & Engineering) at SRKR Engineering College for the Freshers 2026 orientation and membership drive.

---

## Features
- **Interactive Freshers Portal**: Dynamic registration interface with responsive UI, interactive floating badges, and an Avengers/Marvel orientation theme.
- **Atomic ACE ID Allocation**: Concurrently-safe, atomic registration number generation (`26ACEA001`, `26ACEB001`, etc.) with balanced distribution.
- **Dynamic Certificate Generation**: High-resolution PDF enrollment certificates signed by the Head of CSE Department and ACM Secretary.
- **Email Delivery via Brevo**: Transactional email service sending official dossiers with attached certificates.
- **Protection & Hardening**: Rate-limited registration endpoints, WinAnsi-safe font encoding, and resilient CORS and error handling.

---

## Project Structure
```
ACE_2026_reg/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Input validation & error handling
│   ├── models/             # Mongoose schemas (Registration, AceIdConfig, OneTimeLink)
│   ├── routes/             # API routes (/api/registrations, /api/invite)
│   ├── services/           # Business logic (aceIdService, certificateService, emailService)
│   ├── signatures/         # Official digital signatures
│   ├── templates/          # Certificate background template
│   ├── server.js           # Server entry point
│   ├── app.js              # Express app definition
│   └── .env.example        # Environment variable reference
├── frontend/
│   ├── public/             # Static public assets (favicon.svg)
│   ├── src/
│   │   ├── assets/         # Club logos and team photos
│   │   ├── components/     # UI components
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # Main application component
│   │   └── index.css       # Core stylesheet
│   ├── vite.config.js      # Vite build & proxy configuration
│   └── .env.example        # Frontend environment reference
└── README.md
```

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI, BREVO_API_KEY, BREVO_SENDER_EMAIL, etc.
npm run dev
```
Backend starts by default on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` and automatically proxies `/api` calls to the local backend.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | Required |
| `BREVO_API_KEY` | Brevo v3 REST API Key | Required |
| `BREVO_SENDER_EMAIL`| Verified sender email in Brevo | Required |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `BACKEND_URL` | Public base URL of the backend | `http://localhost:5000` |
| `WHATSAPP_1ST_YEAR_LINK` | 1st Year WhatsApp group URL | Required |
| `WHATSAPP_2ND_YEAR_LINK` | 2nd Year LE WhatsApp group URL | Required |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of registration API | `""` (uses local Vite proxy) or `http://localhost:5000` |
