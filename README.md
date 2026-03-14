# ClinScribe AI (MediNotes Pro)

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19.1.4-61DAFB)
![Status](https://img.shields.io/badge/status-in%20development-orange)

> **Developed by Carlos Egana** — Advanced clinical documentation powered by AI

AI-powered medical consultation assistant that transforms doctor's notes into professional summaries, action items, and patient-friendly communications.

## Overview

ClinScribe AI (operating as **MediNotes Pro**) is a HIPAA-compliant SaaS platform designed for healthcare professionals. It leverages artificial intelligence to streamline the documentation process after patient consultations, saving time and ensuring consistent, professional medical records.

**Status:** 🚧 Currently in active development. Features and UI are being continuously improved.

## Features

- **Professional Summaries** — Generate comprehensive medical record summaries from consultation notes
- **Action Items** — Extract clear next steps and follow-up actions for every consultation
- **Patient Communications** — Draft clear, patient-friendly email communications automatically
- **Secure Authentication** — User registration and login powered by Clerk with JWT validation
- **Subscription Management** — Premium tier billing and access control via Clerk Pricing Tables
- **Real-time AI Processing** — Streaming responses with OpenAI's GPT models via SSE
- **Medical-Tech UI** — High-contrast design system optimized for healthcare professionals
- **Serverless Deployment** — Frontend hosted on Vercel with edge network distribution

## Integrations

### Clerk (Authentication & Billing)
- **User Authentication** — Sign up, sign in, password reset, and session management
- **Protected Routes** — Premium content guarded by subscription plan validation
- **Pricing Tables** — Integrated subscription tiers with Stripe billing (Clerk PricingTable component)
- **JWT Templates** — Custom JWT claims for secure API authorization
- **User Profiles** — Account management with UserButton component

### Vercel (Deployment)
- **Frontend Hosting** — Next.js app deployed on Vercel's edge network
- **Serverless Functions** — API routes running as edge functions
- **Environment Variables** — Secure secret management via Vercel dashboard
- **Preview Deployments** — Automatic branch preview URLs

### OpenAI (AI Processing)
- **GPT-5-nano** — Streaming consultation summaries via Server-Sent Events
- **FastAPI Backend** — Python API with Clerk JWT validation
- **Real-time Output** — Markdown-formatted responses delivered progressively

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (Pages Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 with custom medical-tech design system
- **Authentication:** Clerk
- **State Management:** React Hooks
- **Streaming:** Server-Sent Events (SSE)
- **Design:** Medical-tech aesthetic with blue/teal/emerald high-contrast palette

### Backend
- **API Framework:** FastAPI (Python)
- **Authentication:** Clerk JWT validation
- **AI Model:** OpenAI GPT-5-nano
- **Streaming:** SSE for real-time response delivery

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   Clerk Auth    │────▶│   FastAPI       │
│   Frontend      │     │   (JWT)         │     │   Backend       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   SSE Stream    │◀──────────────────────────│   OpenAI API    │
│   (Markdown)    │                           │   (GPT-5-nano)  │
└─────────────────┘                           └─────────────────┘
```

## Installation

### Prerequisites
- Node.js 20+
- Python 3.11+
- OpenAI API key
- Clerk account with JWT template configured

### Frontend Setup

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Run development server:
```bash
npm run dev
```

### Backend Setup

```bash
cd api
pip install -r requirements.txt
```

Create `.env`:
```env
OPENAI_API_KEY=sk-...
CLERK_JWKS_URL=https://.../jwks
```

Start API server:
```bash
uvicorn api.index:app --reload
```

## Usage

1. **Sign In** — Access the platform using Clerk authentication
2. **Subscription** — Upgrade to premium via the pricing table (if not subscribed)
3. **New Consultation** — Enter patient name, visit date, and consultation notes
4. **Generate Summary** — Click to stream AI-generated output including:
   - Medical record summary for doctor's records
   - Clear next steps and follow-up actions
   - Draft email to patient in accessible language

## Project Structure

```
saas/
├── pages/              # Next.js frontend
│   ├── index.tsx       # Landing page (MediNotes Pro)
│   ├── product.tsx     # Consultation form + subscription
│   ├── _app.tsx        # App wrapper with Clerk provider
│   └── _document.tsx   # Document template
├── api/                # FastAPI backend
│   └── index.py        # SSE streaming endpoint
├── styles/             # Global styles
├── public/             # Static assets
└── package.json        # Dependencies
```

## Security & Compliance

- **HIPAA Awareness:** Designed with healthcare data sensitivity in mind
- **JWT Authentication:** All API calls authenticated via Clerk
- **No Data Persistence:** Consultation data processed in real-time, not stored
- **Secure Streaming:** SSE connections authorized per-request

## Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key | `.env.local` |
| `CLERK_SECRET_KEY` | Clerk backend key | `.env.local` |
| `OPENAI_API_KEY` | OpenAI API access | `api/.env` |
| `CLERK_JWKS_URL` | Clerk JWKS endpoint | `api/.env` |

## API Endpoint

### POST `/api`

Generates consultation summary via streaming response.

**Headers:**
- `Authorization: Bearer <clerk_jwt>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "patient_name": "John Doe",
  "date_of_visit": "2024-01-15",
  "notes": "Patient presented with..."
}
```

**Response:** `text/event-stream` — Markdown-formatted AI output

## Future Enhancements

- [ ] Multi-language support for patient communications
- [ ] Integration with EHR systems
- [ ] Voice-to-text note input
- [ ] Custom summary templates by specialty
- [ ] Audit logging for compliance

## License

Private — All rights reserved.

---

**Built for healthcare professionals who value their time and their patients' clarity.**
