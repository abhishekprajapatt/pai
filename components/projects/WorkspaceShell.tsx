'use client';

import { ReactNode, useState } from 'react';
import { Search, Plus, X, Sparkles } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface WorkspaceShellProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export default function WorkspaceShell({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: WorkspaceShellProps) {
  const [expand, setExpand] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-[#f3f1ed]">
      <Sidebar expand={expand} setExpand={setExpand} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12">
          <header className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#a18d78]">
                <Sparkles size={13} /> Prajapatt workspace
              </p>
              <h1 className="font-head text-4xl font-semibold tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-3 max-w-2xl text-sm text-white/50">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[.04] px-3 py-2">
                  <Search size={16} className="text-white/50" />
                  <input
                    autoFocus
                    placeholder="Search"
                    className="w-32 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <Search size={19} />
                </button>
              )}
              {actionLabel && (
                <button
                  type="button"
                  onClick={onAction}
                  className="flex items-center gap-2 rounded-lg bg-[#f4f2ef] px-4 py-2 text-sm font-medium text-[#161616] transition hover:bg-white"
                >
                  <Plus size={16} />
                  {actionLabel}
                </button>
              )}
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
