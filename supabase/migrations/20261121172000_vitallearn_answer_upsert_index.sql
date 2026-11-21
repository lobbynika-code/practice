drop index if exists public.student_answers_session_question_uidx;
create unique index if not exists student_answers_session_question_uidx
  on public.student_answers(session_id, question_id);