-- VitalLearn schema (Supabase project: practice)
create extension if not exists pgcrypto;

create table public.education_levels (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, created_at timestamptz default now());
create table public.examination_types (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, created_at timestamptz default now());
create table public.subjects (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, category text not null default 'Other', description text, icon text, created_at timestamptz default now());
create table public.topics (id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade, name text not null, description text, learning_objectives text, created_at timestamptz default now());
create table public.lessons (id uuid primary key default gen_random_uuid(), topic_id uuid not null references public.topics(id) on delete cascade, title text not null, content text not null, worked_example text, created_at timestamptz default now());

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text not null default '', avatar_url text, country text, education_level_id uuid references public.education_levels(id), school text, exam_system text, role text not null default 'student' check (role in ('student','teacher','moderator','admin')), points int not null default 0, is_public boolean not null default true, onboarding_done boolean not null default false, created_at timestamptz default now(), updated_at timestamptz default now());

create table public.questions (id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id), topic_id uuid references public.topics(id), education_level_id uuid references public.education_levels(id), exam_type_id uuid references public.examination_types(id), question_text text not null, question_type text not null default 'multiple_choice' check (question_type in ('multiple_choice','multiple_answer','true_false','short_answer','numerical','structured','essay')), difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')), marks int not null default 1, explanation text, image_url text, source text, is_published boolean not null default false, attempts int not null default 0, saves int not null default 0, likes int not null default 0, created_by uuid references auth.users(id), created_at timestamptz default now());
create table public.question_options (id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade, option_text text not null, position int not null default 0);
-- Correct answers are stored separately and NEVER exposed to students via RLS.
create table public.question_answers (question_id uuid primary key references public.questions(id) on delete cascade, correct_option_ids text[] not null default '{}', correct_text text);

create table public.practice_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, subject_id uuid references public.subjects(id), timed boolean not null default false, duration_seconds int, total_questions int not null default 0, status text not null default 'in_progress' check (status in ('in_progress','submitted','abandoned')), score int, max_score int, percentage int, correct_count int, started_at timestamptz default now(), submitted_at timestamptz, created_at timestamptz default now());
create table public.practice_session_questions (session_id uuid not null references public.practice_sessions(id) on delete cascade, question_id uuid not null references public.questions(id), position int not null, primary key (session_id, question_id));
create table public.student_answers (id uuid primary key default gen_random_uuid(), session_id uuid references public.practice_sessions(id) on delete cascade, question_id uuid not null references public.questions(id), user_id uuid not null references auth.users(id) on delete cascade, selected_option_id text, selected_text text, is_correct boolean, marks_awarded int default 0, marked_for_review boolean default false, created_at timestamptz default now(), unique (session_id, question_id));
create table public.saved_questions (user_id uuid not null references auth.users(id) on delete cascade, question_id uuid not null references public.questions(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, question_id));
create table public.question_likes (user_id uuid not null references auth.users(id) on delete cascade, question_id uuid not null references public.questions(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, question_id));
create table public.question_comments (id uuid primary key default gen_random_uuid(), question_id uuid references public.questions(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, body text not null, created_at timestamptz default now());
create table public.comment_likes (id uuid primary key default gen_random_uuid(), comment_id uuid not null references public.question_comments(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz default now(), unique (comment_id, user_id));
create table public.ai_conversations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text, mode text default 'tutor', created_at timestamptz default now());
create table public.ai_messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.ai_conversations(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, role text not null check (role in ('user','assistant')), content text not null, created_at timestamptz default now());
create table public.homework_uploads (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, file_name text not null, file_path text not null, file_type text, file_size int, status text default 'uploaded', created_at timestamptz default now());
create table public.learning_activity (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, activity_type text not null, metadata jsonb default '{}', created_at timestamptz default now());
create table public.achievements (id uuid primary key default gen_random_uuid(), name text not null, description text, icon text);
create table public.user_achievements (user_id uuid not null references auth.users(id) on delete cascade, achievement_id uuid not null references public.achievements(id) on delete cascade, awarded_at timestamptz default now(), primary key (user_id, achievement_id));
create table public.points_transactions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, points int not null, reason text, reference_id uuid, created_at timestamptz default now());
create table public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id) on delete cascade, target_type text not null, target_id text not null, reason text, status text default 'open', created_at timestamptz default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text, body text, is_read boolean default false, created_at timestamptz default now());
create table public.subscription_plans (id uuid primary key default gen_random_uuid(), name text not null, price_cents int default 0, ai_daily_limit int default 20, features jsonb default '{}');
create table public.user_subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, plan_id uuid references public.subscription_plans(id), status text default 'active', current_period_end timestamptz, created_at timestamptz default now());
create table public.user_preferences (user_id uuid not null references auth.users(id) on delete cascade, subject_id uuid not null references public.subjects(id) on delete cascade, primary key (user_id, subject_id));

create index idx_questions_subject on public.questions(subject_id);
create index idx_questions_published on public.questions(is_published, created_at desc);
create index idx_topics_subject on public.topics(subject_id);
create index idx_sessions_user on public.practice_sessions(user_id, created_at desc);
create index idx_answers_user on public.student_answers(user_id);
create index idx_ai_messages_conv on public.ai_messages(conversation_id, created_at);
create index idx_activity_user on public.learning_activity(user_id, created_at desc);

-- Privileged helpers (security definer; owner bypasses RLS)
create or replace function public.is_admin() returns boolean language sql security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher')) $$;
create or replace function public.increment_attempts(qid uuid) returns void language plpgsql security definer set search_path = public as $$ begin update public.questions set attempts = attempts + 1 where id = qid; end $$;
create or replace function public.add_points(uid uuid, pts int) returns void language plpgsql security definer set search_path = public as $$ begin update public.profiles set points = points + pts where id = uid; end $$;

-- Auto-create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Counter triggers for saves/likes
create or replace function public.bump_counter() returns trigger language plpgsql as $$ begin if tg_op = 'INSERT' then update public.questions set saves = saves + 1 where id = new.question_id; elsif tg_op = 'DELETE' then update public.questions set saves = greatest(saves - 1, 0) where id = old.question_id; end if; return coalesce(new, old); end $$;
create trigger trg_saved_counter after insert or delete on public.saved_questions for each row execute function public.bump_counter();

alter table public.education_levels enable row level security;
alter table public.examination_types enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answers enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_session_questions enable row level security;
alter table public.student_answers enable row level security;
alter table public.saved_questions enable row level security;
alter table public.question_likes enable row level security;
alter table public.question_comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.homework_uploads enable row level security;
alter table public.learning_activity enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.points_transactions enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_preferences enable row level security;

-- Public educational content: readable by everyone, writable by admins only
create policy "public read" on public.education_levels for select using (true);
create policy "admin write" on public.education_levels for all using (public.is_admin()) with check (public.is_admin());
create policy "public read" on public.examination_types for select using (true);
create policy "admin write" on public.examination_types for all using (public.is_admin()) with check (public.is_admin());
create policy "public read" on public.subjects for select using (true);
create policy "admin write" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
create policy "public read" on public.topics for select using (true);
create policy "admin write" on public.topics for all using (public.is_admin()) with check (public.is_admin());
create policy "public read" on public.lessons for select using (true);
create policy "admin write" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "public read" on public.achievements for select using (true);
create policy "public read" on public.subscription_plans for select using (true);
create policy "published read" on public.questions for select using (is_published = true or public.is_admin());
create policy "admin write" on public.questions for all using (public.is_admin()) with check (public.is_admin());
create policy "options of published" on public.question_options for select using (exists (select 1 from public.questions q where q.id = question_id and (q.is_published = true or public.is_admin())));
create policy "admin write" on public.question_options for all using (public.is_admin()) with check (public.is_admin());
-- question_answers: intentionally NO policies — only service_role (server-side grading) can read it.

create policy "own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy "own sessions" on public.practice_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own session questions" on public.practice_session_questions for select using (exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "own answers" on public.student_answers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved" on public.saved_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own likes" on public.question_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments read" on public.question_comments for select using (true);
create policy "own comments" on public.question_comments for insert with check (auth.uid() = user_id);
create policy "own comment write" on public.question_comments for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "own comment delete" on public.question_comments for delete using (auth.uid() = user_id or public.is_admin());
create policy "own comment likes" on public.comment_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ai conv" on public.ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own ai msgs" on public.ai_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own uploads" on public.homework_uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own activity" on public.learning_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "own points read" on public.points_transactions for select using (auth.uid() = user_id);
create policy "own reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "admin reports" on public.reports for select using (public.is_admin());
create policy "own notifications" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscriptions" on public.user_subscriptions for select using (auth.uid() = user_id);
create policy "own preferences" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket for homework files
insert into storage.buckets (id, name, public) values ('homework-uploads','homework-uploads', false) on conflict (id) do nothing;
create policy "own folder insert" on storage.objects for insert with check (bucket_id = 'homework-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own folder select" on storage.objects for select using (bucket_id = 'homework-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own folder delete" on storage.objects for delete using (bucket_id = 'homework-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
