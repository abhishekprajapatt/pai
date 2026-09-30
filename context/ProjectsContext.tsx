'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ProjectRecord {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  summary?: string;
  status?: 'draft' | 'active' | 'archived';
  tags?: string[];
  ownerId?: string;
  metadata?: Record<string, any>;
}

interface ProjectsContextValue {
  projects: ProjectRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (
    input: Partial<ProjectRecord>,
  ) => Promise<ProjectRecord | null>;
  updateProject: (
    id: string,
    input: Partial<ProjectRecord>,
  ) => Promise<ProjectRecord | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(
  undefined,
);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error('Unable to load projects');
      }
      const result = (await response.json()) as { projects?: ProjectRecord[] };
      setProjects(result.projects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (input: Partial<ProjectRecord>) => {
    const payload = {
      name: input.name ?? 'Untitled project',
      description: input.description ?? '',
      summary: input.summary ?? '',
      status: input.status ?? 'draft',
      tags: input.tags ?? [],
      metadata: input.metadata ?? {},
    };

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create project');
    }

    const result = (await response.json()) as { project?: ProjectRecord };
    const nextProject = result.project ?? payload;
    setProjects((current) => [nextProject, ...current]);
    return nextProject;
  }, []);

  const updateProject = useCallback(
    async (id: string, input: Partial<ProjectRecord>) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update project');
      }

      const result = (await response.json()) as { project?: ProjectRecord };
      const project = result.project ?? {
        ...(input as ProjectRecord),
        _id: id,
      };
      setProjects((current) =>
        current.map((item) =>
          item._id === id || item.id === id ? project : item,
        ),
      );
      return project;
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete project');
    }

    setProjects((current) =>
      current.filter((item) => item._id !== id && item.id !== id),
    );
    return true;
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      loading,
      error,
      refresh,
      createProject,
      updateProject,
      deleteProject,
    }),
    [
      projects,
      loading,
      error,
      refresh,
      createProject,
      updateProject,
      deleteProject,
    ],
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within ProjectsProvider');
  }
  return context;
}
