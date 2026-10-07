'use client';

import Link from 'next/link';
import { assets } from '@/public/assets/assets';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Image from 'next/image';

const pillars = [
  {
    title: 'AI-first workflow',
    text: 'Turn loose ideas into structured execution with context-aware AI, prompt guidance, and meaningful momentum.',
    accent: 'from-[#f5c7a9]/20 to-[#f5c7a9]/5',
  },
  {
    title: 'Built for teams',
    text: 'Create, review, and iterate in one space so product thinking stays connected across the team.',
    accent: 'from-[#7ad7c4]/20 to-[#7ad7c4]/5',
  },
  {
    title: 'Action over noise',
    text: 'Prioritize clarity, speed, and practical output instead of endless dashboards and scattered tools.',
    accent: 'from-[#a2b8ff]/20 to-[#a2b8ff]/5',
  },
];

const brands = [
  'Microsoft',
  'Google',
  'Meta',
  'Anthropic',
  'OpenAI',
  'Prajapatt',
];

const outcomes = [
  { value: '2x', label: 'faster planning cycles' },
  { value: '90%', label: 'less context switching' },
  { value: '24/7', label: 'project momentum' },
  { value: '1 place', label: 'for ideas, work, and decisions' },
];

const steps = [
  {
    title: 'Capture the idea',
    text: 'Start with a prompt, concept, or rough requirement and convert it into a working project frame.',
  },
  {
    title: 'Shape the execution',
    text: 'Organize priorities, structure work, and align the team without losing clarity in the process.',
  },
  {
    title: 'Ship with confidence',
    text: 'Use built-in workflows to iterate, validate, and move from idea to output faster and with more control.',
  },
];

const mockupImage =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f';

const showcaseCards = [
  {
    title: 'AI workflow studio',
    description:
      'Turn ideas into structured momentum with collaborative execution.',
    image: assets.devstudio,
  },
  {
    title: 'Team context',
    description:
      'Keep decisions, files, and actions aligned in one focused workspace.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
  },
  {
    title: 'Creative clarity',
    description:
      'Move from raw concepts to polished outputs without the clutter.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
  },
  {
    title: 'Simple execution',
    description: 'Replace busywork with confident action and visible progress.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white hover:text-white"
          >
            ← Home
          </Link>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-white/60">
            About Prajapatt AI
          </div>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-[#0f1117] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-[#f5c7a9]/30 bg-[#f5c7a9]/10 px-4 py-2 text-sm text-[#f5c7a9]">
                Prajapatt AI
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Build with intent. Move faster with AI.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
                Prajapatt AI helps teams turn ideas into execution. It blends
                conversations, project thinking, and structured work into a
                single focused environment built for product builders,
                operators, founders, and modern teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0b0b0d] transition hover:bg-gray-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/company"
                  className="rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/5"
                >
                  Company
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 text-sm text-white/70">
                <div>
                  <div className="text-2xl font-semibold text-white">1</div>
                  <div>workspace</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-white">AI</div>
                  <div>assistance</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-white">∞</div>
                  <div>iterations</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#151820] p-2">
                <video
                  src="/assets/video/auth_ads.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-white/45">
              Prajapatt AI models
            </p>
            <h2 className="mt-2 text-2xl font-medium sm:text-3xl">
              Meet Prajapatt 1
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              One model family, with names that make it easy to find the right
              fit for the way you work.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Prajapatt 1',
              'Prajapatt 1 Pro',
              'Prajapatt 1 Reasoning',
              'Prajapatt 1 Mini',
            ].map((model) => (
              <div
                key={model}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
              >
                <p className="text-lg font-medium text-white">{model}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-[#0d1117] p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                Trusted by builders
              </p>
              <h2 className="mt-2 text-2xl font-medium sm:text-3xl">
                Teams that work with modern AI tools
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <div
                key={brand}
                className="flex min-h-[72px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70"
              >
                {brand}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-medium sm:text-3xl">
              Why teams choose Prajapatt
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className={`rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${pillar.accent} p-[1px]`}
              >
                <div className="h-full rounded-[1.7rem] bg-[#101318] p-6">
                  <div className="mb-4 h-11 w-11 rounded-xl bg-white/5" />
                  <h3 className="mb-3 text-xl font-medium text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-7 text-white/70">
                    {pillar.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-[#0d1117] p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-medium sm:text-3xl">
              Measured results
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {outcomes.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="text-3xl font-semibold text-white">
                  {item.value}
                </div>
                <p className="mt-3 text-sm text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-medium sm:text-3xl">
              From idea to execution
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#f5c7a9]/10 text-sm font-semibold text-[#f5c7a9]">
                  0{index + 1}
                </div>
                <h3 className="mb-3 text-xl font-medium text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-white/70">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1117]">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                Why it matters
              </p>
              <h2 className="mt-3 text-3xl font-medium sm:text-4xl">
                AI should reduce friction, not create complexity.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/70">
                Prajapatt is designed to keep work focused, collaborative, and
                practical—so teams can move from conversation to action without
                losing momentum.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-[#121821] p-4">
              <img
                src={mockupImage}
                alt="Brand grid mockup"
                loading="lazy"
                className="h-full w-full rounded-[1.3rem] object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-[#0d1117] p-6 sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                Product gallery
              </p>
              <h2 className="mt-2 text-2xl font-medium sm:text-3xl">
                Built for focused, collaborative work
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {showcaseCards.map((card) => (
              <div
                key={card.title}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#121821]"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={
                      typeof card.image === 'string'
                        ? card.image
                        : card.image.src
                    }
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-medium text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
