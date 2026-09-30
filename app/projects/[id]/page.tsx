'use client';

import { ArrowUp, Folder, X } from 'lucide-react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useProjectsContext } from '@/context/ProjectsContext';
import Workspace from '@/components/projects/Workspace';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useFirebaseAuth();
  const { projects, createProject, loading } = useProjectsContext();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [buildPrompt, setBuildPrompt] = useState('');

  const projectCount = useMemo(() => projects.length, [projects]);

  const handleCreateProject = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const created = await createProject({
      name: trimmedName,
      description:
        description.trim() || 'A focused workspace for your next idea.',
      summary: description.trim() || 'A focused workspace for your next idea.',
      status: 'draft',
      tags: ['project'],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    setName('');
    setDescription('');
    setIsCreating(false);
    router.push(`/projects/${created?._id ?? created?.id ?? trimmedName}`);
  };

  const startBuild = async () => {
    const prompt = buildPrompt.trim();
    if (!prompt) return;

    const created = await createProject({
      name: prompt.slice(0, 42).trim() || 'New project',
      description: prompt,
      summary: prompt,
      status: 'draft',
      tags: ['prompt'],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    setBuildPrompt('');
    router.push(
      `/projects/${created?._id ?? created?.id ?? crypto.randomUUID()}?prompt=${encodeURIComponent(prompt)}`,
    );
  };

  const projectId = params.id;
  const currentProject = projects.find(
    (project) => (project._id ?? project.id) === projectId,
  );
  const projectName = decodeURIComponent(
    projectId?.replace(/-/g, ' ') || 'Project',
  );
  const initialPrompt = searchParams.get('prompt') || '';

  if (projectId && currentProject) {
    return (
      <Workspace projectName={projectName} initialPrompt={initialPrompt} />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-[#f5efe8] md:px-8">
      {isAuthenticated && (
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#bba690]">
              Prajapatt workspace
            </p>
            <h1 className="font-head text-4xl font-semibold tracking-tight md:text-5xl">
              Projects
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            New project
          </button>
        </header>
      )}

      <section className="mb-10 rounded-[2rem] border border-white/10 bg-[#171717] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-7">
        <textarea
          value={buildPrompt}
          onChange={(event) => setBuildPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void startBuild();
            }
          }}
          placeholder="What do you want to build?"
          rows={3}
          className="w-full resize-none bg-transparent text-lg text-[#f5efe8] outline-none placeholder:text-white/35"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void startBuild()}
            disabled={!buildPrompt.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f4f1ee] px-4 py-2 text-sm font-medium text-[#111111] transition disabled:opacity-40"
          >
            Build <ArrowUp size={15} />
          </button>
        </div>
      </section>

      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="font-head text-2xl font-medium">Your projects</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/55">
          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="mx-auto mt-20 max-w-md rounded-[2rem] border border-white/10 bg-[#121212] p-10 text-center">
          <Folder size={44} className="mx-auto mb-6 text-white/35" />
          <h3 className="font-head text-2xl">Start a project</h3>
          <p className="mt-2 text-sm text-white/50">
            Organize your work in one focused space with prompts, files, and
            notes.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="mt-6 rounded-xl bg-white px-4 py-2 text-sm text-black"
          >
            New project
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const projectIdKey = project._id ?? project.id;
            return (
              <article
                key={projectIdKey}
                className="group rounded-[1.75rem] border border-white/10 bg-[#171717] p-5 transition hover:border-white/20 hover:bg-[#1b1b1b]"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efe8]/5 text-[#d8c6ad]">
                    <Folder size={18} />
                  </div>
                  <span className="text-xs text-white/40">
                    {project.metadata?.updatedAt
                      ? new Date(project.metadata.updatedAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )
                      : 'Now'}
                  </span>
                </div>

                <h3 className="font-head text-2xl leading-tight">
                  {project.name}
                </h3>
                <p className="mt-3 min-h-[64px] text-sm leading-6 text-white/55">
                  {project.description ||
                    project.summary ||
                    'No description provided.'}
                </p>

                <button
                  type="button"
                  onClick={() => router.push(`/projects/${projectIdKey}`)}
                  className="mt-6 inline-flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
                >
                  Open project <span aria-hidden="true">-&gt;</span>
                </button>
              </article>
            );
          })}
        </div>
      )}

      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-[#1d1d1d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-head text-3xl">Create a project</h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name your project"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-blue-400"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe your project, goals, subject, etc..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-blue-400"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateProject()}
                  disabled={!name.trim()}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#111111] disabled:opacity-45"
                >
                  Create project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
