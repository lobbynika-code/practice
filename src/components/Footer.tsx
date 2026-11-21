import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
export default function Footer() {
  return <footer className="mt-16 border-t py-10" style={{borderColor:'var(--line)'}}>
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:flex-row sm:text-left">
      <div><p className="flex items-center justify-center gap-2 font-extrabold sm:justify-start"><GraduationCap className="text-teal-400" size={19}/> VitalLearn</p><p className="muted mt-2 text-xs">Learn. Practise. Excel.</p></div>
      <div className="muted flex flex-wrap justify-center gap-5 text-sm"><Link href="/pricing">Pricing</Link><Link href="/about">About</Link><Link href="/features">Features</Link><Link href="/privacy">Privacy</Link></div>
      <p className="muted text-xs">Built for learners in Ghana and worldwide.</p>
    </div>
  </footer>;
}
