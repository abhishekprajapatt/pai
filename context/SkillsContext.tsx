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

export interface SkillRecord {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status?: 'enabled' | 'disabled' | 'draft';
  prompt?: string;
  config?: Record<string, any>;
  author?: string;
  userId?: string;
}

interface SkillsContextValue {
  skills: SkillRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSkill: (input: Partial<SkillRecord>) => Promise<SkillRecord | null>;
  updateSkill: (
    id: string,
    input: Partial<SkillRecord>,
  ) => Promise<SkillRecord | null>;
  deleteSkill: (id: string) => Promise<boolean>;
}

const SkillsContext = createContext<SkillsContextValue | undefined>(undefined);

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customize/skills', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Unable to load skills');
      }
      const result = (await response.json()) as { skills?: SkillRecord[] };
      setSkills(result.skills ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSkill = useCallback(async (input: Partial<SkillRecord>) => {
    const payload = {
      name: input.name ?? 'New skill',
      description: input.description ?? '',
      category: input.category ?? 'General',
      version: input.version ?? '1.0.0',
      status: input.status ?? 'draft',
      prompt: input.prompt ?? '',
      config: input.config ?? {},
      author: input.author ?? 'Prajapatt AI',
    };

    const response = await fetch('/api/customize/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create skill');
    }

    const result = (await response.json()) as { skill?: SkillRecord };
    const nextSkill = result.skill ?? payload;
    setSkills((current) => [nextSkill, ...current]);
    return nextSkill;
  }, []);

  const updateSkill = useCallback(
    async (id: string, input: Partial<SkillRecord>) => {
      const response = await fetch(`/api/customize/skills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update skill');
      }

      const result = (await response.json()) as { skill?: SkillRecord };
      const skill = result.skill ?? { ...(input as SkillRecord), _id: id };
      setSkills((current) =>
        current.map((item) =>
          item._id === id || item.id === id ? skill : item,
        ),
      );
      return skill;
    },
    [],
  );

  const deleteSkill = useCallback(async (id: string) => {
    const response = await fetch(`/api/customize/skills/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete skill');
    }

    setSkills((current) =>
      current.filter((item) => item._id !== id && item.id !== id),
    );
    return true;
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<SkillsContextValue>(
    () => ({
      skills,
      loading,
      error,
      refresh,
      createSkill,
      updateSkill,
      deleteSkill,
    }),
    [skills, loading, error, refresh, createSkill, updateSkill, deleteSkill],
  );

  return (
    <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>
  );
}

export function useSkillsContext() {
  const context = useContext(SkillsContext);
  if (!context) {
    throw new Error('useSkillsContext must be used within SkillsProvider');
  }
  return context;
}
