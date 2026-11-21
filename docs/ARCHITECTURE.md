# VitalLearn Architecture

## Decisions
- **Next.js App Router** (existing repo was empty; Vercel-native, SSR + API routes in one codebase).
- **Supabase** for Postgres, Auth, Storage. All privileged operations go through `/api/*` routes using a server-only service-role client (`src/lib/supabase/admin.ts`).
- **Answer security**: `question_answers` has RLS enabled with zero policies. Students never read correct answers directly; grading (`/api/exam/submit`, `/api/questions/check`) and post-submission review (`/api/results/[sessionId]`) run server-side.
- **Roles**: `profiles.role` (student/teacher/moderator/admin). Students cannot change their own role (RLS `with check` pins role to its current value). Admin checks use the `is_admin()` security-definer function.
- **AI**: provider-agnostic layer (`src/lib/ai/provider.ts`), server-only keys, daily rate limit (20/day free), conversation history in `ai_conversations`/`ai_messages`. Uploaded content is treated as untrusted data in the system prompt.
- **Trending**: `trendingScore = (attempts + 3·saves + 2·likes + 4·comments) / (1 + ageDays/7)` — transparent and documented in the UI.
- **Points**: awarded only server-side on submission (`add_points` RPC + `points_transactions` audit row), so clients cannot forge scores.
- **Storage**: private `homework-uploads` bucket; objects namespaced by user id with matching storage policies; 10MB + PDF/PNG/JPG validation server-side.

## Known limitations / next steps
- AI requires `AI_PROVIDER` + `AI_API_KEY`; vision for image questions needs a vision-capable model configured.
- DOCX homework support, email verification enforcement, and billing webhooks are stubbed for future phases.
- Sample testimonials on the landing page are clearly labelled as samples.
