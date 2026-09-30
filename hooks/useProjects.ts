'use client';

import { useCallback, useEffect, useState } from 'react';

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

export function useProjects() {
  const [items, setItems] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load projects');
      }
      const result = (await response.json()) as { projects?: ProjectRecord[] };
      setItems(result.projects ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load projects');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<ProjectRecord>) => {
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
    const nextItem = result.project ?? {
      ...payload,
      name: payload.name ?? 'Untitled project',
      description: payload.description ?? '',
      summary: payload.summary ?? '',
      status: payload.status ?? 'draft',
      tags: payload.tags ?? [],
    };
    setItems((current) => [nextItem, ...current]);
    return nextItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<ProjectRecord>) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update project');
      }

      const result = (await response.json()) as { project?: ProjectRecord };
      const nextItem = result.project ?? {
        ...(payload as ProjectRecord),
        _id: id,
      };
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
    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete project');
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
