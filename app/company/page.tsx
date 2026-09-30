'use client';

import Link from 'next/link';
import { assets } from '@/public/assets/assets';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import Image from 'next/image';

export default function CompanyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-4">
        <section className="overflow-hidden rounded-[8px] bg-white/5 text-white">
          <div className="grid items-center gap-8 px-6 py-6 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-8">
            <div className="max-w-xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                The future of work is connected.
              </h1>
              <p className="mt-4 text-base text-white/80">
                Prajapatt brings together productivity, cloud, AI,
                communication, and operations into one connected experience for
                modern teams.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex rounded-md bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
              >
                Learn more
              </Link>
            </div>

            <div className="flex justify-center">
              <video
                src="/video/spiderman.mp4"
                poster="/video/auth_ads.webp"
                className="h-[260px] w-full max-w-[540px] rounded-[20px] object-none shadow-2xl object-cover"
                playsInline
                autoPlay
                loop
                muted
              />
            </div>
          </div>
        </section>

        <section className="my-8 rounded-[18px] border border-white/10 p-6 text-white">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                ✉
              </span>
              <span>Prajapatt Mail</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                ☁
              </span>
              <span>Prajapatt Cloud</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                💬
              </span>
              <span>Prajapatt Chat</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                @
              </span>
              <span>Prajapatt Social</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                🎥
              </span>
              <span>Prajapatt Meet</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                ◫
              </span>
              <span>Prajapatt OS</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                🤖
              </span>
              <span>Prajapatt AI</span>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#181b20] p-3 text-sm font-medium text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b0d12] text-lg text-white">
                ⌘
              </span>
              <span>Developer Tools</span>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.pmail}
                alt="Prajapatt Mail"
                width={40}
                height={40}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Mail
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Smart email, priority inbox, automation, and AI-assisted
                  communication for modern teams.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.pcloud}
                alt="Prajapatt Cloud"
                width={40}
                height={40}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Cloud
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Secure file storage, sync, collaboration, and a unified
                  digital workspace built for enterprise teams.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.pchat}
                alt="Prajapatt Chat"
                width={40}
                height={40}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Chat
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Real-time collaboration, knowledge sharing, and AI workflows
                  designed for fast-moving teams.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.psocial}
                alt="Prajapatt Social"
                width={40}
                height={40}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Social
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  A connected social layer for communities, updates, discovery,
                  and real-time conversations across your network.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.pmeet}
                alt="Prajapatt Meet"
                width={40}
                height={40}
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Meet
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Meetings, recordings, and team syncs with smart summaries,
                  actions, and follow-through built in.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-white/10 bg-[#111318] p-4 text-white shadow-sm md:p-5">
          <div className="grid items-center gap-4 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                Designed for life today — and tomorrow
              </h2>
              <p className="mt-3 max-w-xl text-base text-white/70">
                From connected workflows to smarter communication, Prajapatt is
                building a future ecosystem for productivity, AI, and business
                growth.
              </p>
              <Link
                href="/about"
                className="mt-5 inline-flex rounded-md border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                See if your PC is ready
              </Link>
            </div>
            <Image
              src={assets.dashboard}
              alt="Laptop and device showcase"
              loading="lazy"
              className="h-[220px] w-full rounded-[14px] object-cover"
            />
          </div>
        </section>

        <section className="py-8 text-white">
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-white">
            For business
          </h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.crm}
                alt="Prajapatt CRM"
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt CRM
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Smart customer workflows, pipeline visibility, and AI-driven
                  engagement for growing teams.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.techsuite}
                loading="lazy"
                alt="Prajapatt Tech Suite"
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt Tech Suite
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  A unified stack for productivity, collaboration, sales, and
                  operational execution across the business.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Explore
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.workspace}
                alt="Prajapatt AI Workspace"
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Prajapatt AI Workspace
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Build faster with connected knowledge, AI actions, and one
                  place for strategy and execution.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#111318] shadow-sm">
              <Image
                src={assets.devstudio}
                alt="Developer Studio"
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-white">
                  Developer Studio
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  APIs, workflows, automation tooling, and productivity
                  utilities for modern software teams.
                </p>
                <Link
                  href="/about"
                  className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Coming soon
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[18px] border border-white/10 bg-[#101114] p-4 shadow-sm md:p-5">
          <div className="grid items-center gap-4 md:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                Less plastic, more planet
              </h2>
              <p className="mt-3 max-w-xl text-base text-white/70">
                From reducing waste to building AI that supports real work,
                discover how Prajapatt is helping create a more sustainable and
                thoughtful future.
              </p>
              <Link
                href="/about"
                className="mt-5 inline-flex rounded-md border border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
              >
                Learn more
              </Link>
            </div>
            <Image
              src={assets.sustainability}
              loading="lazy"
              alt="Planet and sustainability"
              className="h-[220px] w-full rounded-[14px] object-cover"
            />
          </div>
        </section>

        <section className="mt-10 rounded-[18px] px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Can we help you?</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">Follow Prajapatt</span>
              <div className="flex gap-2 text-lg">
                <span>f</span>
                <span>x</span>
                <span>◌</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
