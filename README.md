# SkillPulse: AI-Powered Talent Screening Platform

SkillPulse is a full-stack recruitment platform that helps recruiters screen resumes faster and more fairly using Gemini AI.

It solves a daily hiring workflow problem:
- Recruiters spend too much time manually reading resumes.
- Candidate quality signals are inconsistent and hard to compare.
- Screening decisions are often not explainable.

SkillPulse provides:
- Structured job creation with screening criteria
- Resume upload and parsing
- Gemini-powered candidate scoring and recommendations
- Explainable screening outputs (strengths, gaps, interview questions)
- Shortlisting and candidate comparison
- Recruiter analytics dashboard

## Tech Stack

- Language: TypeScript
- Frontend: Next.js (App Router)
- State Management: Redux + Redux Toolkit
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- AI/LLM: Gemini API (mandatory)

## Architecture Overview

- frontend/: Next.js recruiter web app
- backend/: REST API, AI orchestration, MongoDB models

Flow:
1. Recruiter creates a job posting with requirements.
2. Recruiter uploads candidate resumes.
3. Backend parses resume content and stores candidate profiles.
4. Gemini AI evaluates each candidate against job criteria.
5. Screening results are saved and visualized in dashboard pages.

## Core Features

- Authentication (register/login/profile)
- Job management (create, list, view, edit, delete)
- Candidate ingestion (single and bulk resume upload)
- AI screening:
  - weighted overall score
  - recommendation labels
  - category-level scoring
  - skill-level assessment
  - strengths, weaknesses, skill gaps
  - AI interview questions
  - bias-awareness notes
- Auto-shortlist by score and recommendation
- Candidate comparison using AI summary
- Analytics and hiring pipeline stats

## Project Structure

- backend/src/config: env, DB, Gemini config
- backend/src/controllers: auth, jobs, candidates, screening
- backend/src/models: User, Job, Candidate, Screening
- backend/src/routes: API route modules
- backend/src/services: resume parser, AI screening service
- frontend/src/app: landing, auth, dashboard pages
- frontend/src/components: UI components and loaders
- frontend/src/store: Redux store and slices
- frontend/src/services: axios API client
- frontend/src/types: shared frontend types

## Environment Variables

### Backend (.env)
Use backend/.env.example as template.

Required:
- PORT
- NODE_ENV
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- GEMINI_API_KEY
- FRONTEND_URL
- MAX_FILE_SIZE

### Frontend (.env.local)
Use frontend/.env.example as template.

Required:
- NEXT_PUBLIC_API_URL

## Local Setup

## 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill GEMINI_API_KEY and MONGODB_URI
npm run dev
```

Backend runs on http://localhost:5000

Health check:
- GET /api/health

## 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on http://localhost:3000

## API Modules

- /api/auth
  - POST /register
  - POST /login
  - GET /profile
  - PUT /profile

- /api/jobs
  - GET /
  - POST /
  - GET /:id
  - PUT /:id
  - DELETE /:id
  - GET /dashboard/stats

- /api/candidates
  - GET /
  - GET /:id
  - PATCH /:id/status
  - DELETE /:id
  - POST /job/:jobId/upload
  - POST /job/:jobId/bulk-upload

- /api/screening
  - POST /candidate/:candidateId
  - POST /job/:jobId/all
  - GET /job/:jobId
  - GET /job/:jobId/shortlist
  - GET /:id
  - POST /compare

## AI Decision Flow (Gemini)

1. Input assembly:
- job description
- requirements
- preferred skills
- responsibilities
- candidate resume text

2. Prompting and scoring:
- Gemini model: gemini-1.5-flash
- JSON-constrained response requested
- weighted category scoring and recommendation

3. Output validation:
- response parsed and sanitized
- values clamped to expected ranges
- invalid labels normalized to safe defaults

4. Persistence:
- screening result saved in MongoDB
- candidate/job statuses and counters updated

5. Explainability surfaced to recruiter:
- summary and category details
- skill evidence and match type
- interview questions and bias-awareness notes

## Assumptions

- Recruiter users are primary users for this MVP.
- Resume parsing quality is best for PDF/TXT.
- Screening runs synchronously from API calls.
- MongoDB Atlas or equivalent managed MongoDB is used in deployment.

## Limitations

- Bulk screening is sequential to reduce LLM rate-limit risks.
- DOC/DOCX parsing is basic in this version.
- No background queue yet for long-running screening batches.
- No multi-tenant org-level role hierarchy in MVP.

## Deployment Requirements

Recommended:
- Frontend: Vercel
- Backend: Railway / Render / Fly.io
- Database: MongoDB Atlas

Minimum production checklist:
- Configure all env variables securely
- Restrict CORS to deployed frontend URL
- Use strong JWT secret
- Monitor API errors and rate limits

## Pitch Notes (2-slide friendly)

Slide 1: Problem and Solution
- Problem: Manual resume review is slow and inconsistent.
- Solution: SkillPulse automates and explains candidate screening with AI.

Slide 2: Product and Impact
- Live pipeline from job post to shortlist
- Explainable AI outputs recruiters can trust
- Faster hiring, more consistent decisions, practical daily workflow fit

## License

For hackathon evaluation and demonstration use.
