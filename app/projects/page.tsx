'use client';

import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { EllipsisVertical, Folder, Search, X } from 'lucide-react';

import { useFirebaseAuth } from '@/context/AuthContext';
import {
  useProjectsContext,
  type ProjectRecord,
} from '@/context/ProjectsContext';
import {
  ProjectForm,
  type ProjectFormValues,
} from '@/components/forms/ProjectForm';
import Sidebar from '@/components/layout/Sidebar';
import SearchOverlay from '@/components/shared/SearchOverlay';
import { Spinner } from '@/components/ui/spinner';
import ChatActionMenu from '@/components/cards/Menu';

const formatProjectDate = (value: string | Date | undefined) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const ProjectsPage: React.FC = () => {
  const { user: firebaseUser, isAuthenticated } = useFirebaseAuth();
  const { projects, createProject, deleteProject } = useProjectsContext();
  const router = useRouter();

  const [expand, setExpand] = useState<boolean>(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Shared'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<{
    id: string | null;
    open: boolean;
  }>({
    id: null,
    open: false,
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setInitialLoadDone(true);
  }, []);

  useEffect(() => {
    setWelcomeMessage(
      firebaseUser
        ? `Hey ${firebaseUser?.displayName || 'there'}, here are all your project spaces.`
        : 'Here are your project spaces. Login to sync across devices.',
    );
  }, [firebaseUser]);

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project: ProjectRecord) => {
          if (filter === 'All') return true;
          return Boolean(project.metadata?.shared);
        })
        .filter((project: ProjectRecord) =>
          project.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a: ProjectRecord, b: ProjectRecord) => {
          const aDate = new Date(
            String(a.metadata?.updatedAt || a.summary || 0),
          ).getTime();
          const bDate = new Date(
            String(b.metadata?.updatedAt || b.summary || 0),
          ).getTime();
          return bDate - aDate;
        }),
    [projects, filter, searchQuery],
  );

  const toggleSelection = (projectId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
    if (!selectionMode) {
      setSelectionMode(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(
      new Set(
        filteredProjects.map(
          (project: ProjectRecord) => project._id ?? project.id ?? '',
        ),
      ),
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    for (const projectId of Array.from(selectedIds)) {
      if (!projectId) continue;
      await deleteProject(projectId);
    }

    setSelectedIds(new Set());
    toast.success('Deleted selected projects');
  };

  const handleCreateProject = async (values: ProjectFormValues) => {
    const created = await createProject({
      name: values.name,
      description: values.description,
      summary: values.summary,
      status: values.status,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    setIsCreating(false);
    router.push(`/projects/${created?._id ?? created?.id ?? values.name}`);
  };

  const openProject = (project: ProjectRecord) => {
    router.push(`/projects/${project._id ?? project.id}`);
  };

  if (!initialLoadDone) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {isAuthenticated && <Sidebar expand={expand} setExpand={setExpand} />}

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Projects</h1>
              <p className="mt-2 text-sm text-slate-400">{welcomeMessage}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectionMode ? (
                <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-300">
                    {selectedIds.size} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-serif text-sm transition hover:bg-white/10"
                    >
                      {selectedIds.size === filteredProjects.length
                        ? 'Unselect all'
                        : 'Select all'}
                    </button>
                    <button
                      disabled={selectedIds.size === 0}
                      onClick={() =>
                        toast('Move to project not implemented yet')
                      }
                      className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Move to project
                    </button>
                    <button
                      disabled={selectedIds.size === 0}
                      onClick={() => void handleDeleteSelected()}
                      className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectionMode(false);
                        setSelectedIds(new Set());
                      }}
                      className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="rounded-md border border-white/10 bg-white/5 p-2 text-sm transition hover:bg-white/10"
                  >
                    <Search className="h-6 w-6" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setFilterOpen((prev) => !prev)}
                      className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-serif text-sm transition hover:border-white/20"
                    >
                      Filter by {filter}
                    </button>
                    {filterOpen && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-3xl border border-white/10 bg-[#111111] p-2 shadow-xl">
                        {(['All', 'Shared'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setFilter(option);
                              setFilterOpen(false);
                            }}
                            className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectionMode((prev) => !prev)}
                    className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-serif text-sm transition hover:bg-white/10"
                  >
                    {selectionMode ? 'Cancel selection' : 'Select projects'}
                  </button>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-serif text-sm transition hover:bg-white/10"
                  >
                    New project
                  </button>
                </>
              )}
            </div>
          </div>

          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />

          <div className="shadow-xl shadow-black/20">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.length === 0 ? (
                <p className="text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  No projects found.
                </p>
              ) : (
                filteredProjects.map((project: ProjectRecord) => {
                  const projectId = project._id ?? project.id ?? '';
                  const isChecked = selectedIds.has(projectId);
                  const projectDate = formatProjectDate(
                    project.metadata?.updatedAt,
                  );
                  const previewDescription =
                    project.description ||
                    project.summary ||
                    'No description yet';

                  return (
                    <div
                      key={projectId}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111214] px-2 py-1 transition hover:border-white/15 hover:bg-[#17181b]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {selectionMode && (
                            <label
                              className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition ${
                                isChecked
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-white/20 bg-transparent hover:border-white/30'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelection(projectId)}
                                className="sr-only"
                              />
                              {isChecked && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M5 12l5 5L19 7" />
                                </svg>
                              )}
                            </label>
                          )}

                          <button
                            onClick={() => openProject(project)}
                            className="min-w-0 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Folder className="h-4 w-4 text-slate-400" />
                              <div className="truncate text-base font-medium text-white">
                                {project.name || 'Untitled project'}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                              {projectDate || 'Just now'}
                            </div>
                            <div className="mt-2 max-w-xs truncate text-sm text-slate-300">
                              {previewDescription}
                            </div>
                          </button>
                        </div>

                        <div className="relative">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuOpen((prev) => ({
                                id: prev.id === projectId ? null : projectId,
                                open: prev.id !== projectId || !prev.open,
                              }));
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/70 transition hover:border-white/10 hover:bg-white/5"
                          >
                            <EllipsisVertical size={18} />
                          </button>

                          <ChatActionMenu
                            open={menuOpen.open && menuOpen.id === projectId}
                            onClose={() =>
                              setMenuOpen({ id: null, open: false })
                            }
                            onSelect={() => openProject(project)}
                            onRename={() =>
                              toast('Rename action not implemented yet')
                            }
                            onDelete={() => {
                              if (projectId) void deleteProject(projectId);
                              setMenuOpen({ id: null, open: false });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-[#1d1d1d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-3xl">Create a project</h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              <ProjectForm
                initialValues={{
                  name: '',
                  description: '',
                  summary: '',
                  status: 'draft',
                  tags: '',
                }}
                onSubmit={handleCreateProject}
                onCancel={() => setIsCreating(false)}
                submitLabel="Create project"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
