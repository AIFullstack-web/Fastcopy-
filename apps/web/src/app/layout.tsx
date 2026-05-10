import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fastcopy | Hyperlocal Web-to-Print Marketplace',
  description: 'Upload PDFs, match with nearby verified print vendors, and track printing orders in realtime.',
  openGraph: { title: 'Fastcopy', description: 'Fast, secure, local document printing.', type: 'website' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
