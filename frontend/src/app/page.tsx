'use client';

import Link from 'next/link';
import { SparklesIcon, ShieldCheckIcon, ChartBarIcon, ClockIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Screening',
    description: 'Leverage Gemini AI to analyze resumes against job requirements with evidence-based scoring.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Bias Detection',
    description: 'Built-in bias awareness flags ensure fair and equitable candidate evaluation.',
  },
  {
    icon: ChartBarIcon,
    title: 'Data-Driven Insights',
    description: 'Comprehensive analytics and visualizations to make informed hiring decisions.',
  },
  {
    icon: ClockIcon,
    title: 'Save 80% Time',
    description: 'Automate tedious resume screening and focus on what matters — finding the right talent.',
  },
  {
    icon: UserGroupIcon,
    title: 'Smart Shortlisting',
    description: 'AI automatically ranks and shortlists top candidates based on weighted criteria.',
  },
  {
    icon: BoltIcon,
    title: 'Interview Prep',
    description: 'Get AI-generated interview questions tailored to each candidate\'s profile and gaps.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SkillPulse</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <SparklesIcon className="w-4 h-4" />
            Powered by Gemini AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Screen Talent
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Smarter & Faster
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            SkillPulse uses advanced AI to analyze resumes, score candidates objectively,
            and provide explainable recommendations — reducing screening time by 80%.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-3.5 shadow-lg shadow-primary-600/25">
              Start Screening Free
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-3.5">
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div>
              <p className="text-3xl font-bold text-gray-900">80%</p>
              <p className="text-sm text-gray-500">Time Saved</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">95%</p>
              <p className="text-sm text-gray-500">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">0%</p>
              <p className="text-sm text-gray-500">Bias</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smarter Hiring
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From resume analysis to interview preparation, SkillPulse covers the entire screening workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card p-8 hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">Three simple steps to transform your hiring process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Post Your Job', desc: 'Create a job posting with requirements, skills, and responsibilities.' },
              { step: '02', title: 'Upload Resumes', desc: 'Upload candidate resumes individually or in bulk. Supports PDF, DOC, and TXT.' },
              { step: '03', title: 'Get AI Insights', desc: 'AI analyzes each resume, provides scores, rankings, and interview questions.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join recruiters who are making smarter, faster, and fairer hiring decisions with AI.
          </p>
          <Link href="/register" className="inline-block bg-white text-primary-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-colors shadow-xl">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SkillPulse</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} SkillPulse. AI-Powered Talent Screening Platform.
          </p>
          <p className="text-xs mt-2">Built for the Umurava Innovation Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
