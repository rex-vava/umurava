import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillPulse - AI-Powered Talent Screening',
  description: 'Intelligent recruitment screening powered by AI. Screen candidates faster, reduce bias, and make data-driven hiring decisions.',
  keywords: ['recruitment', 'AI screening', 'talent acquisition', 'hiring', 'Gemini AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
