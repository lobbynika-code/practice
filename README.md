# VitalLearn — Learn. Practise. Excel.

All-in-one digital learning & examination preparation platform (Next.js + Supabase). Built for students in Ghana and worldwide: basic school → SHS → university → professional exams.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase PostgreSQL + Auth + Storage (project: `practice`)
- Recharts analytics, Lucide icons
- Configurable AI provider (OpenAI / Gemini) via server-only env vars

## Quick start
```bash
npm install
cp .env.example .env.local   # fill in Supabase + AI keys
npm run dev                  # http://localhost:3000
npm test                     # unit tests (scoring, trending, streaks)
npm run build
```

## Database
- Schema: `supabase/migrations/0001_vitallearn_schema.sql` (also applied to Supabase project `practice` via migrations `vitallearn_tables` + `vitallearn_security`)
- Seed content: `supabase/seed.sql` (13 subjects, 19 topics, 25 original questions)
- RLS enabled on every table. Correct answers live in `question_answers` with **no student policies** — grading happens server-side in `/api/exam/submit` and `/api/questions/check` using the service-role key.

## Make yourself admin
After registering, run in Supabase SQL editor:
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```

## AI setup
Set server-only env vars (never `NEXT_PUBLIC_`):
```
AI_PROVIDER=openai   # or gemini | none
AI_API_KEY=...
AI_MODEL=gpt-4o-mini
```
Without a key, `/api/ai/chat` returns `503 AI_NOT_CONFIGURED` — the UI explains this honestly instead of faking responses.

## Deployment (Vercel)
1. Push this repo to GitHub.
2. Create a Vercel project from the repo (framework: Next.js).
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`.
4. Deploy. Add the production URL to Supabase Auth → URL Configuration (Site URL + redirect allow list).

## Features
Landing, auth + onboarding, dashboard, learning centre, exam engine (timed/untimed, mark-for-review, server-side grading, detailed results), trending questions (transparent score), AI tutor, AI homework assistant (private uploads), analytics, leaderboards/gamification, community, settings, admin (questions/subjects/import), freemium-ready plans.

## Testing
`npm test` runs unit tests for answer grading, trending ranking, streaks and points. Manual QA checklist: register → onboard → practice → submit → review → save/like/comment → trending → AI (with key) → homework upload → admin.
