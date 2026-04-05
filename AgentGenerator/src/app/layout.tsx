import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'AgentForge — AI Agent Generator',
  description:
    'Generate production-grade AI agent prompts with cognitive architecture, skill resolution, and quality gate evaluation. Powered by GPT-5.4, Claude Opus 4.6, and Gemini 3.1 Pro.',
  keywords: ['AI agent', 'agent generator', 'LLM prompt', 'Claude', 'GPT', 'Gemini'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
