import Link from 'next/link';
import { Sparkles, Brain, Trophy, TrendingUp, Upload, BarChart3, ShieldCheck, Zap } from 'lucide-react';
export const dynamic = 'force-dynamic';
const FEATURES = [
  { icon: Zap, t: 'Exam Practice Engine', d: 'Timed mock exams with a question navigator, mark-for-review and instant detailed results.' },
  { icon: Brain, t: 'AI Solution Tutor', d: 'Step-by-step explanations, hints first, simpler explanations and follow-up questions.' },
  { icon: Upload, t: 'Homework Assistant', d: 'Upload photos or PDFs of homework and get guided, structured help — not just answers.' },
  { icon: TrendingUp, t: 'Trending Questions', d: 'See what students are attempting, saving and discussing right now, ranked transparently.' },
  { icon: BarChart3, t: 'Progress Analytics', d: 'Accuracy by subject and topic, streaks, strengths and recommended revision.' },
  { icon: Trophy, t: 'Gamification', d: 'Points, badges, streaks and leaderboards that reward real learning effort.' },
];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Integrated Science','Computer Science','English Language','Literature','History','Geography','Government','Economics','Religious & Moral Education'];
export default function Home() {
  return <div>
    <section className="fade-up py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">Learn. Practise. Excel.</p>
      <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">Learn Smarter. Practise Better. <span className="grad-text">Achieve More.</span></h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg opacity-80">Your complete examination preparation platform. Learn, practise, challenge yourself and get personalised AI-powered academic support — from basic school to university and professional exams.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/register" className="btn-primary">Start Practising Free →</Link><Link href="/#features" className="btn-ghost">Explore Features</Link></div>
      <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-teal-300"/> Secure accounts & private data</span><span className="flex items-center gap-2"><Sparkles size={16} className="text-teal-300"/> AI tutor & homework help</span><span className="flex items-center gap-2"><Trophy size={16} className="text-teal-300"/> Competitions & badges</span></div>
    </section>
    <section id="features" className="py-10"><h2 className="text-3xl font-extrabold text-center">Everything you need to <span className="grad-text">excel</span></h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{FEATURES.map(f => <div key={f.t} className="card p-6 fade-up"><f.icon className="text-indigo-400" /><h3 className="mt-3 font-bold">{f.t}</h3><p className="mt-2 text-sm opacity-75">{f.d}</p></div>)}</div></section>
    <section className="py-10"><h2 className="text-2xl font-extrabold">Subjects & exam categories</h2><div className="mt-4 flex flex-wrap gap-2">{SUBJECTS.map(s => <span key={s} className="rounded-full border border-indigo-400/30 px-4 py-2 text-sm">{s}</span>)}</div>
      <p className="mt-4 text-sm opacity-70">Examination systems: BECE, WASSCE, university and general academic practice — configurable for international exams.</p></section>
    <section className="py-10"><h2 className="text-2xl font-extrabold">How VitalLearn works</h2><div className="mt-4 grid gap-5 md:grid-cols-3">{[['1. Learn','Browse structured lessons, notes and worked examples by subject and topic.'],['2. Practise','Take timed or untimed practice exams and review every answer with explanations.'],['3. Improve','Track analytics, earn points and badges, and ask the AI tutor when you are stuck.']].map(([t,d]) => <div key={t} className="card p-6"><h3 className="font-bold">{t}</h3><p className="mt-2 text-sm opacity-75">{d}</p></div>)}</div></section>
    <section className="py-10"><h2 className="text-2xl font-extrabold">Student voices</h2><p className="mt-2 text-sm opacity-60">Sample testimonials — real student quotes will appear here once collected with permission.</p><div className="mt-4 grid gap-5 md:grid-cols-3">{['“The step-by-step AI explanations finally made algebra click for me.” — Sample student, SHS','“Timed practice with instant review feels like a real exam.” — Sample student, JHS','“My streak keeps me practising every day.” — Sample student, University'].map(q => <blockquote key={q} className="card p-6 text-sm italic">{q}</blockquote>)}</div></section>
    <section className="py-10 text-center"><h2 className="text-2xl font-extrabold">Ready to start?</h2><p className="mt-2 opacity-75">Free forever for core practice. Premium plans coming soon.</p><Link href="/register" className="btn-primary mt-5">Create Free Account →</Link></section>
  </div>;
}
