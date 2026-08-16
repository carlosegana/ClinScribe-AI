<div align="center">

<img src="img/Logo.jpeg" width="440" alt="ClinScribe AI — Streams documentation. Restores care." />

### The visit is over. The paperwork isn't.

**Every clinician pays the same tax.** The patient walks out, and then comes the second shift —
hours a day retyping what you already know, while the waiting room fills and dinner goes cold.
Documentation has quietly become the reason good clinicians burn out.

**ClinScribe AI hands that time back.** Paste the encounter exactly as you scribbled it —
abbreviations, fragments, vitals and all. Get back a clean visit summary, a prioritized
follow-up list, and a patient-ready message. One pass. You stay the editor.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## See it run

Messy notes in. Three finished clinical artifacts out — streamed token by token, in seconds.

<div align="center">
  <img src="img/demo.gif" width="880" alt="ClinScribe AI end-to-end demo" />
</div>

---

## Why this exists

Clinicians didn't train for years to become typists. Yet after every encounter the same ritual
repeats: open a blank field, reconstruct what just happened, and translate it three times over —
once for the chart, once for the care plan, once for the patient. It's repetitive, it's
error-prone when you're tired, and it's the quiet thief of both clinical time and attention.

ClinScribe AI attacks exactly that moment. It takes the messy, real-world notes you already
write and turns them into three finished artifacts in a single streamed pass — so the writing is
done by the time you've read it, and your job shrinks to what it should have been all along:
**reviewing and approving, not retyping.**

**What it is not:** not an EHR, not a scribe that listens to audio, and not a certified medical
device. It is a single, focused text-to-documentation step that a clinician reviews before use.

---

## How it works

### 1 · Land

A single promise, no onboarding maze. Clinical intelligence that converts encounters into
structured records — in seconds.

<div align="center">
  <img src="img/landingpage.png" width="880" alt="ClinScribe AI landing page" />
</div>

<br/>

### 2 · Write it the way you actually write it

Patient, date, and the raw note. Fragments, abbreviations, vitals, dosages — no template to
fill, no fields to fight.

<div align="center">
  <img src="img/product.png" width="880" alt="Consultation notes input form" />
</div>

<br/>

### 3 · Get three finished artifacts

The response streams live as Markdown. Same three sections, every single time — the backend
verifies their presence before it closes the stream.

<div align="center">
  <img src="img/result_sample.png" width="880" alt="Generated clinical documentation" />
</div>

```
### Summary of visit for the doctor's records
### Next steps for the doctor
### Draft of email to patient in patient-friendly language
```

---

## Quick start

**Prerequisites** — Node.js 20+, Python 3.12+, and the
[Vercel CLI](https://vercel.com/docs/cli) (the Python function does not run under `next dev`).
You will also need an [OpenAI API key](https://platform.openai.com/api-keys) and a
[Clerk](https://clerk.com) application.

```bash
git clone https://github.com/carlosegana/ClinScribe-AI.git
cd ClinScribe-AI
npm install
```

**Frontend credentials** — copy the example and fill in your Clerk keys:

```bash
cp env.local.example .env.local
```

```ini
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**Backend credentials** — create `api/.env` with the two required variables:

```ini
# api/.env
OPENAI_API_KEY=sk-...
CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json
```

**Run both halves together:**

```bash
vercel dev     # → http://localhost:3000
```

> `npm run dev` starts only the Next.js frontend. Requests to `/api` will 404 until the Python
> serverless function is running, which is what `vercel dev` provides locally.

<details>
<summary><b>Backend configuration reference</b></summary>

<br/>

| Variable | Default | Purpose |
|:--|:--|:--|
| `OPENAI_API_KEY` | — | **Required** · read by the OpenAI client |
| `CLERK_JWKS_URL` | — | **Required** · JWT signature verification |
| `OPENAI_MODEL` | `gpt-4o-mini` | Inference model |
| `OPENAI_TIMEOUT` | `60` | Request timeout, in seconds |
| `RATE_LIMIT_MAX` | `10` | Requests per window, per user |
| `RATE_LIMIT_WINDOW` | `60` | Window, in seconds |

</details>

---

## Architecture

A Next.js frontend and a Python inference endpoint deployed as a single Vercel project.
Auth is verified at the edge of the API, not the client.

```mermaid
flowchart LR
    A["Browser<br/>/product"] -->|"POST /api<br/>Bearer JWT"| B["FastAPI<br/>serverless fn"]
    B --> C{"Clerk JWKS<br/>verify"}
    C -->|"401"| A
    C -->|"sub"| D["Rate limit<br/>10 req / 60s"]
    D -->|"429"| A
    D --> E["OpenAI<br/>chat.completions"]
    E -.->|"SSE · JSON frames"| A
    A --> F["Buffer → Markdown<br/>live render"]
```

| Stage | Detail |
|:--|:--|
| **Transport** | Server-Sent Events. Each frame is JSON-encoded so newlines survive intact. |
| **Auth** | Clerk JWT verified server-side against the JWKS endpoint. `sub` becomes the rate-limit key. |
| **Validation** | Pydantic bounds every field — patient name ≤ 120 chars, date ≤ 40, notes ≤ 8 000. |
| **Guardrail** | Patient notes are treated strictly as data — embedded instructions are summarized, never executed. |
| **Contract** | The final frame reports whether all three required sections were produced. |

---

## API

### `POST /api`

Requires a Clerk-issued bearer token. Returns a `text/event-stream`.

**Request**

```jsonc
POST /api
Authorization: Bearer <clerk_jwt>
Content-Type: application/json

{
  "patient_name": "Frank Martin",     // 1–120 chars
  "date_of_visit": "2026-03-15",      // 1–40 chars
  "notes": "58yo, lower back pain…"   // 1–8000 chars
}
```

**Response frames**

```jsonc
data: { "text": "### Summary of visit…" }                    // n content frames
data: { "done": true, "valid": true, "missing_sections": [] } // terminal, on success
data: { "error": "AI service error. Please try again." }      // terminal, upstream failure
data: { "error": "Unexpected error generating summary." }     // terminal, unhandled failure
```

**Status codes**

| Code | Meaning |
|:--|:--|
| `200` | Stream opened — check the terminal frame for `valid` |
| `401` | Missing or invalid Clerk JWT |
| `422` | Field validation failed |
| `429` | Rate limit exceeded for this user |

---

## Stack

| Layer | Technology |
|:--|:--|
| **Frontend** | Next.js 16 (Pages Router) · React 19 · TypeScript · Tailwind CSS 4 |
| **Motion** | GSAP + ScrollTrigger — pinned scroll-telling, parallax, stagger |
| **Streaming** | `@microsoft/fetch-event-source` → `react-markdown` + `remark-gfm` |
| **Backend** | FastAPI · Pydantic · `fastapi-clerk-auth` — Vercel Python runtime |
| **Inference** | OpenAI `gpt-4o-mini`, streamed |
| **Identity** | Clerk — JWT + JWKS, plan-gated routes |
| **Delivery** | Vercel — CI on push to `main` |

---

## Engineering notes

- **SSE framing** — chunks are JSON-encoded rather than raw. Plain SSE collapses `\n`, which
  would destroy Markdown structure mid-stream.
- **Rate limiting** — an in-memory `deque` per user, so it holds only within a warm serverless
  instance. A shared store (Upstash Redis) is the path to true multi-instance limiting.
- **Prompt injection** — the system prompt pins notes as clinical data. Commands found inside
  a note are reported as content, not obeyed.
- **Overlay clipping** — the date picker renders through a portal so it escapes the card's
  containing block instead of being clipped by it.

---

## Status

**Public beta** · under active development.

> Consultation notes are sent to an external AI service to generate output. This is **not a
> certified or HIPAA-compliant medical service** and must not be used for care.
> **Do not enter real protected health information (PHI).**

---

<div align="center">
<sub>Built by <a href="https://github.com/carlosegana">Carlos Egaña</a></sub>
</div>
