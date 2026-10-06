# API Reference

Base URL: `/api`. All responses are JSON with a `success` boolean; errors include a `message`.

Authenticated endpoints need `Authorization: Bearer <token>`. Tokens are returned by login and OTP verification and expire after `JWT_EXPIRE` (default 24h).

## Auth

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | `name, email, password, phone?, dateOfBirth?, gender?, address?` | Creates a **patient** and emails a 6-digit OTP (valid 10 min). Re-registering an unverified email resends the OTP. `409` if already verified. |
| POST | `/auth/verify-otp` | `email, otp` | Returns `token` and `user`. Locked after 5 wrong attempts (`429`); register again for a new code. |
| POST | `/auth/login` | `email, password, role?` | `403` if `role` doesn't match the account. |
| POST | `/auth/logout` | — | Stateless; the client discards its token. |

## Profile (any role)

| Method | Path | Body |
|--------|------|------|
| GET | `/profile` | — returns `user` and, for patients, `patientDetails` |
| PUT | `/profile/update` | `name?, phone?, address?, dateOfBirth?, gender?` |
| PUT | `/profile/password` | `currentPassword, newPassword` (`400` if the current password is wrong) |

## Patient

| Method | Path | Notes |
|--------|------|-------|
| GET | `/patient/dashboard` | Vitals, upcoming appointments, recent reports |
| GET | `/patient/reports` | All of the patient's reports |
| GET | `/patient/medical-history` | History, allergies, medications, vitals |
| GET | `/patient/doctors` | Doctors available for booking |

## Appointments

| Method | Path | Roles | Notes |
|--------|------|-------|-------|
| POST | `/appointments/book` | patient | `doctorId, appointmentDate (YYYY-MM-DD), appointmentTime (HH:MM), reason`. Rejects past dates (`400`) and taken slots (`409`). |
| GET | `/appointments` | any | Patients see their own, doctors see theirs, nurses see all |
| PUT | `/appointments/:id` | doctor, nurse | `status? (scheduled/completed/cancelled/no-show), notes?`. Doctors can only update their own appointments. |

## Nurse

| Method | Path | Roles | Notes |
|--------|------|-------|-------|
| POST | `/nurse/upload-report` | nurse, doctor | `multipart/form-data`: `file` (PDF/JPG/PNG/DOC/DOCX, ≤10MB), `patientId`, `title`, `reportType?`, `description?`, `testDate?` |
| PUT | `/nurse/patient/:id/vitals` | nurse, doctor | `bloodPressure? ("120/80"), heartRate?, temperature?, weight?, height?` |
| GET | `/nurse/patients` | nurse | Verified patients |
| GET | `/nurse/reports` | nurse, doctor | 20 most recent reports uploaded by the caller |

## Doctor

| Method | Path | Notes |
|--------|------|-------|
| GET | `/doctor/dashboard` | `stats.totalPatients`, `stats.todayAppointments`, `stats.totalReports`, upcoming appointments |
| GET | `/doctor/patients` | Verified patients |
| GET | `/doctor/patient/:id` | Patient profile, details, reports and appointments |

## Reports

| Method | Path | Notes |
|--------|------|-------|
| GET | `/reports/:id` | Report metadata. Patients can only access their own. |
| GET | `/reports/:id/download` | The file itself, with the same access rule. Files are never served publicly. |

## Chatbot

| Method | Path | Notes |
|--------|------|-------|
| POST | `/chatbot/send` | `message` (≤1000 chars). Returns `reply`, `isEmergency`, `aiPowered`. Falls back to safe static guidance if the AI provider is unavailable. |
| GET | `/chatbot/history` | Latest 100 messages, oldest first |

## Health

`GET /health` returns `200` when the database is connected and `503` otherwise.

## Limits

- 300 requests per 15 min per IP across the API; 10 per 15 min for login, registration and OTP verification.
- JSON bodies are limited to 100kb. Bodies or queries containing MongoDB operator keys (`$…`) are rejected with `400`.
