'use client';

import { useEffect, useState } from 'react';
import { Code2, MoreVertical, Plus, X } from 'lucide-react';
import WorkspaceShell from '@/components/projects/WorkspaceShell';

interface Artifact {
  id: string;
  title: string;
  type: string;
  content: string;
  updatedAt: string;
}

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  useEffect(() => {
    const saved = window.localStorage.getItem('prajapatt-artifacts');
    if (saved) {
      const storedArtifacts = JSON.parse(saved) as Artifact[];
      const userArtifacts = storedArtifacts.filter(
        (artifact) => !['welcome', 'starter-code'].includes(artifact.id),
      );
      setArtifacts(userArtifacts);
      window.localStorage.setItem(
        'prajapatt-artifacts',
        JSON.stringify(userArtifacts),
      );
    }
  }, []);
  const createArtifact = () => {
    if (!title.trim()) return;
    const next = [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        type: 'Document',
        content: 'Start writing your artifact here.',
        updatedAt: 'Just now',
      },
      ...artifacts,
    ];
    setArtifacts(next);
    window.localStorage.setItem('prajapatt-artifacts', JSON.stringify(next));
    setTitle('');
    setCreating(false);
  };
  return (
    <WorkspaceShell
      title="Artifacts"
      description="Create documents and code that live beside your chats."
      actionLabel="New artifact"
      onAction={() => setCreating(true)}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artifacts.map((artifact) => (
          <article
            key={artifact.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#191919] transition hover:border-white/25"
          >
            <div className="flex h-44 items-center justify-center bg-[#151515] p-6 text-center">
              <div>
                <Code2 className="mx-auto mb-4 text-white/30" size={30} />
                <p className="line-clamp-4 text-sm text-white/55">
                  {artifact.content}
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{artifact.title}</h2>
                  <p className="mt-1 text-xs text-white/40">
                    {artifact.type} · Edited {artifact.updatedAt}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Artifact actions"
                  className="text-white/40 hover:text-white"
                >
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#202020] p-6">
            <div className="flex justify-between">
              <h2 className="font-head text-2xl font-semibold">
                Create an artifact
              </h2>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Artifact title"
              className="mt-8 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={createArtifact}
              disabled={!title.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-black disabled:opacity-40"
            >
              <Plus size={16} />
              Create artifact
            </button>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
