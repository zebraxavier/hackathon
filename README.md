# AI-Powered Clinical Web Platform

A clinic management web app with three roles — **patients**, **nurses** and **doctors** — plus an AI first-aid assistant.

| Role | What they can do |
|------|------------------|
| Patient | Register with email OTP, book appointments, view vitals, download their reports, chat with the AI assistant |
| Nurse | Upload patient reports (PDF/JPG/PNG/DOC/DOCX), record vitals |
| Doctor | Browse and search patients, view patient records and reports, manage appointment status |

**Stack:** React 18 + TypeScript + Vite (frontend) · Node.js + Express + MongoDB/Mongoose (backend) · Groq (OpenAI-compatible) for the AI assistant.

> ⚠️ The AI assistant gives general first-aid guidance only. It does not diagnose or prescribe. Before handling real patient data, review the [production checklist](#production-checklist), including the legal and compliance requirements for health data where you operate.

---

## Quick start (local development)

Requirements: Node.js 18+, MongoDB 6+ running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # then set JWT_SECRET (and MONGODB_URI if not local)
npm run seed                  # creates demo users — DELETES ALL existing data
npm run dev                   # http://localhost:5000/api

# 2. Frontend (new terminal, repo root)
npm install
npm run dev                   # http://localhost:5173
```

### Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Doctor | doctor@test.com | test123 |
| Nurse | nurse@test.com | test123 |
| Patient | patient@test.com | test123 |
| Patient | mary@test.com | test123 |

In development, when SMTP is not configured, registration OTPs are printed to the backend console.

---

## Configuration

### Backend — `backend/.env`

See [`backend/.env.example`](backend/.env.example) for the full list.

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | At least 32 random characters in production |
| `FRONTEND_URL` | ✅ in prod | Allowed CORS origin(s), comma-separated |
| `EMAIL_USER`, `EMAIL_PASS` | ✅ in prod | SMTP credentials for OTP emails (Gmail: use an App Password) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_FROM` | | Defaults: `smtp.gmail.com`, `587` |
| `AI_API_KEY` | | Groq API key. Without it the chatbot returns safe fallback replies |
| `AI_MODEL`, `AI_API_URL` | | Defaults: `llama-3.3-70b-versatile`, Groq endpoint |
| `EMERGENCY_NUMBER` | | Number quoted in emergency replies (default `911`; e.g. `112`/`108` in India) |
| `UPLOAD_DIR` | | Where report files are stored (default `backend/uploads`) |

The server refuses to start if a required variable is missing.

### Frontend — build-time env (`.env.local` or hosting dashboard)

| Variable | Notes |
|----------|-------|
| `VITE_API_URL` | Backend base URL including `/api`, e.g. `https://api.example.com/api` |
| `VITE_SUPPORT_EMAIL` | Optional support inbox shown on the Help page |

---

## Testing

```bash
cd backend && npm test        # API test suite (in-memory MongoDB, no setup needed)
npm run typecheck             # frontend TypeScript check (repo root)
npm run build                 # typecheck + production build
```

The backend suite covers authentication and OTP lockout, role-based access, NoSQL-injection rejection, appointment booking rules, report upload and download permissions, vitals validation and chatbot fallbacks.

---

## Deployment

**Frontend (Vercel):** `vercel.json` is included (SPA rewrites and security headers). Set `VITE_API_URL` in the Vercel project settings.

**Backend (Render, Railway, a VPS, etc.):** run `npm ci && npm start` in `backend/` with `NODE_ENV=production` and the variables above. Health check: `GET /api/health`.

Uploaded reports are stored on disk. Mount `UPLOAD_DIR` on a **persistent volume**; many PaaS file systems are wiped on every deploy.

### Production checklist

- [ ] Strong unique `JWT_SECRET`; database credentials are not the defaults
- [ ] `FRONTEND_URL` set to the exact production origin
- [ ] SMTP configured (registration fails with 502 in production if OTP email can't be sent)
- [ ] `UPLOAD_DIR` on persistent, backed-up, encrypted storage
- [ ] HTTPS on both frontend and API
- [ ] MongoDB backups enabled; access restricted by IP or VPC
- [ ] Never run `npm run seed` against production (it is blocked when `NODE_ENV=production`)
- [ ] Review the regulatory requirements for storing health data in your jurisdiction (e.g. HIPAA, GDPR, India DPDP Act)

---

## Project structure

```
backend/
  app.js            Express app (middleware + routes); server.js starts it
  config/           env validation, database, upload storage
  middleware/       auth, roles, rate limits, validation, error handling
  models/           User, Patient, Appointment, Report, Chat
  routes/           REST endpoints (see backend/API.md)
  services/         AI assistant
  tests/            node:test + supertest suite
src/
  app/pages/        Login, Register, patient/nurse/doctor dashboards, settings
  app/components/   Layout, sidebar, navbar, route guard, UI primitives
  services/         API client per domain
```

See [`backend/API.md`](backend/API.md) for the API reference.

## License

MIT. UI primitives are adapted from [shadcn/ui](https://ui.shadcn.com/) (MIT).
