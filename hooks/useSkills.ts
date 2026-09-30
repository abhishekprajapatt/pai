'use client';

import { useCallback, useEffect, useState } from 'react';

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
}

export function useSkills() {
  const [items, setItems] = useState<SkillRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/skills', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load skills');
      }
      const result = (await response.json()) as { skills?: SkillRecord[] };
      setItems(result.skills ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load skills');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<SkillRecord>) => {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create skill');
    }

    const result = (await response.json()) as { skill?: SkillRecord };
    const nextItem = result.skill ?? {
      ...payload,
      name: payload.name ?? 'New skill',
      description: payload.description ?? '',
      category: payload.category ?? 'general',
      version: payload.version ?? '1.0.0',
      status: payload.status ?? 'draft',
    };
    setItems((current) => [nextItem, ...current]);
    return nextItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<SkillRecord>) => {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update skill');
      }

      const result = (await response.json()) as { skill?: SkillRecord };
      const nextItem = result.skill ?? { ...(payload as SkillRecord), _id: id };
      setItems((current) =>
        current.map((item) =>
          item._id === id || item.id === id ? nextItem : item,
        ),
      );
      return nextItem;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete skill');
    }

    setItems((current) =>
      current.filter((item) => item._id !== id && item.id !== id),
    );
    return true;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh, create, update, remove };
}
