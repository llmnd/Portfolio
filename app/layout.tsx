import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Portfolio | Full Stack Developer',
  description: 'Portfolio professionnel d un développeur Full Stack. Expertise Next.js, Angular, TypeScript, Python, Django et API SaaS.',
  metadataBase: new URL('https://your-portfolio.vercel.app'),
  openGraph: {
    title: 'Portfolio | Full Stack Developer',
    description: 'Portfolio professionnel d un développeur Full Stack premium.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Full Stack Developer',
    description: 'Portfolio professionnel d un développeur Full Stack premium.',
  },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} bg-surface text-slate-900 dark:bg-[#020617] dark:text-slate-100`}>{children}</body>
    </html>
  );
}
