'use client';

import { useCallback, useEffect, useState } from 'react';

export interface PluginRecord {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status?: 'installed' | 'disabled' | 'pending';
  config?: Record<string, any>;
  sourceUrl?: string;
  author?: string;
}

export function usePlugins() {
  const [items, setItems] = useState<PluginRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/plugins', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load plugins');
      }
      const result = (await response.json()) as { plugins?: PluginRecord[] };
      setItems(result.plugins ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load plugins');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<PluginRecord>) => {
    const response = await fetch('/api/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create plugin');
    }

    const result = (await response.json()) as { plugin?: PluginRecord };
    const nextItem = result.plugin ?? {
      ...payload,
      name: payload.name ?? 'New plugin',
      description: payload.description ?? '',
      category: payload.category ?? 'general',
      version: payload.version ?? '1.0.0',
      status: payload.status ?? 'pending',
    };
    setItems((current) => [nextItem, ...current]);
    return nextItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<PluginRecord>) => {
      const response = await fetch(`/api/plugins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update plugin');
      }

      const result = (await response.json()) as { plugin?: PluginRecord };
      const nextItem = result.plugin ?? {
        ...(payload as PluginRecord),
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
    const response = await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete plugin');
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
