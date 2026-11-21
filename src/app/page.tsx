import Link from 'next/link';
import { Sparkles, Brain, Trophy, TrendingUp, Upload, BarChart3, ShieldCheck, Zap, ArrowRight, BookOpen, Target, GraduationCap } from 'lucide-react';
export const dynamic = 'force-dynamic';
const FEATURES = [
  { icon: Zap, t: 'Real exam practice', d: 'Timed and untimed tests, a question navigator, review flags and clear performance reports.' },
  { icon: Brain, t: 'AI learning tutor', d: 'Get guided hints, worked explanations and follow-up support when a topic feels difficult.' },
  { icon: Upload, t: 'Homework support', d: 'Bring a question to the assistant and work through the method, not just the final answer.' },
  { icon: TrendingUp, t: 'Trending questions', d: 'Discover questions learners are saving, attempting and discussing across subjects.' },
  { icon: BarChart3, t: 'Progress insights', d: 'Understand your accuracy, practice history, strengths and topics that need more attention.' },
  { icon: Trophy, t: 'Learning rewards', d: 'Build consistent study habits with points, achievements and friendly leaderboards.' },
];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Integrated Science','Computer Science','English Language','Literature','History','Geography','Government','Economics','Religious & Moral Education'];
export default function Home() {
  return <div className="overflow-hidden">
    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-1 pb-16 pt-16 md:grid-cols-[1.1fr_.9fr] md:pb-24 md:pt-24">
      <div className="fade-up relative z-10 text-center md:text-left">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide md:mx-0" style={{borderColor:'var(--line)',background:'var(--surface)'}}>
          <span className="h-2 w-2 rounded-full bg-teal-400"/><span className="muted">A smarter way to prepare for every exam</span>
        </div>
        <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Your next exam deserves <span className="grad-text">your best preparation.</span></h1>
        <p className="muted mx-auto mt-6 max-w-xl text-base leading-8 md:mx-0 md:text-lg">Learn with structured lessons, practise with exam-style questions and get guided academic support—from basic school to university.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
          <Link href="/register" className="btn-primary">Start learning for free <ArrowRight size={17}/></Link>
          <Link href="/#features" className="btn-ghost">Explore the platform</Link>
        </div>
        <div className="muted mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs md:justify-start">
          <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-teal-400"/> Student-first privacy</span>
          <span className="flex items-center gap-2"><Sparkles size={15} className="text-indigo-400"/> Guided AI support</span>
          <span className="flex items-center gap-2"><GraduationCap size={15} className="text-teal-400"/> Multiple education levels</span>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-lg fade-up">
        <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-teal-400/20 blur-2xl"/>
        <div className="card relative rotate-1 p-5 sm:p-7">
          <div className="flex items-center justify-between"><div><p className="muted text-xs font-semibold uppercase tracking-widest">Your learning space</p><h2 className="mt-1 text-xl font-extrabold">Ready when you are.</h2></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400"><BookOpen size={22}/></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{background:'var(--surface-soft)'}}><Target className="text-teal-400" size={20}/><p className="mt-3 text-sm font-bold">Practice exams</p><p className="muted mt-1 text-xs">Build confidence under time</p></div>
            <div className="rounded-2xl p-4" style={{background:'var(--surface-soft)'}}><Brain className="text-indigo-400" size={20}/><p className="mt-3 text-sm font-bold">AI tutor</p><p className="muted mt-1 text-xs">Understand each step</p></div>
            <div className="rounded-2xl p-4" style={{background:'var(--surface-soft)'}}><TrendingUp className="text-teal-400" size={20}/><p className="mt-3 text-sm font-bold">Your progress</p><p className="muted mt-1 text-xs">See where to improve</p></div>
            <div className="rounded-2xl p-4" style={{background:'var(--surface-soft)'}}><Trophy className="text-amber-400" size={20}/><p className="mt-3 text-sm font-bold">Achievements</p><p className="muted mt-1 text-xs">Celebrate consistency</p></div>
          </div>
          <div className="mt-5 rounded-2xl border p-4" style={{borderColor:'var(--line)'}}><div className="flex items-center justify-between text-sm"><span className="font-semibold">A better study routine</span><span className="muted text-xs">Learn · Practise · Improve</span></div><div className="mt-3 flex gap-1.5"><span className="h-2 flex-1 rounded-full bg-indigo-500"/><span className="h-2 flex-1 rounded-full bg-teal-400"/><span className="h-2 flex-1 rounded-full" style={{background:'var(--surface-soft)'}}/></div></div>
        </div>
      </div>
    </section>
    <section id="features" className="py-14">
      <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-400">Everything in one place</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tools that make <span className="grad-text">learning work.</span></h2><p className="muted mt-4 leading-7">A complete study companion designed to help you understand more, practise consistently and measure your progress.</p></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map((f,i)=><article key={f.t} className="card fade-up p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-400/40"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400"><f.icon size={21}/></div><h3 className="mt-5 text-base font-bold">{f.t}</h3><p className="muted mt-2 text-sm leading-6">{f.d}</p></article>)}</div>
    </section>
    <section className="py-14"><div className="card p-6 sm:p-9"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-400">Explore and grow</p><h2 className="mt-2 text-2xl font-black">A wide range of subjects</h2></div><p className="muted max-w-md text-sm leading-6">Start with the subjects you study today. Education levels and examination systems can be selected as you set up your account.</p></div><div className="mt-6 flex flex-wrap gap-2">{SUBJECTS.map(s=><span key={s} className="rounded-full border px-4 py-2 text-sm" style={{borderColor:'var(--line)',background:'var(--surface-soft)'}}>{s}</span>)}</div><p className="muted mt-5 text-xs">Includes pathways for BECE, WASSCE, university study and general academic practice, with room to expand internationally.</p></div></section>
    <section className="py-14"><div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-r from-indigo-700 to-violet-700 px-6 py-12 text-center text-white shadow-glow sm:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-100">Your journey starts here</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Make every practice session count.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-indigo-100">Create your free account and take the next step toward stronger understanding and better exam performance.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-indigo-700 transition hover:-translate-y-0.5">Create your free account <ArrowRight size={17}/></Link></div></section>
  </div>;
}
