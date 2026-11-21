import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ui';
export const metadata = { title: 'VitalLearn — Learn. Practise. Excel.', description: 'Your complete examination preparation platform with AI-powered academic support.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark"><body><ToastProvider><Navbar /><main className="mx-auto max-w-7xl px-4">{children}</main><Footer /></ToastProvider></body></html>;
}
