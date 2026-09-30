'use client';

import { Code2, FolderGit2, Play, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CodePanel() {
  const router = useRouter();
  return (
    <section>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white/10 p-2 text-white/70">
          <Code2 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Prajapatt Code</h2>
          <p className="mt-1 text-sm text-white/50">
            Build, inspect, and run code with Prajapatt.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push('/code')}
          className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-white/25 hover:bg-white/[.06]"
        >
          <Terminal size={19} className="text-white/60" />
          <h3 className="mt-5 font-medium">Open Code workspace</h3>
          <p className="mt-2 text-sm leading-5 text-white/45">
            Start a focused coding session for explanations, debugging, and
            implementation.
          </p>
        </button>
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:border-white/25 hover:bg-white/[.06]"
        >
          <FolderGit2 size={19} className="text-white/60" />
          <h3 className="mt-5 font-medium">Open a project</h3>
          <p className="mt-2 text-sm leading-5 text-white/45">
            Keep repository context, instructions, and code conversations
            together.
          </p>
        </button>
      </div>
      <div className="mt-8 rounded-xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <Play size={17} className="text-white/60" />
          <h3 className="font-medium">Code capabilities</h3>
        </div>
        <ul className="mt-4 grid gap-3 text-sm text-white/50 sm:grid-cols-2">
          <li>Explain and refactor code</li>
          <li>Design APIs and databases</li>
          <li>Generate tests and documentation</li>
          <li>Create reusable artifacts</li>
        </ul>
      </div>
    </section>
  );
}
