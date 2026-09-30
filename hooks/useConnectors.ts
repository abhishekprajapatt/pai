'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ConnectorRecord {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  type: string;
  status?: 'connected' | 'disconnected' | 'pending';
  config?: Record<string, any>;
  icon?: string;
}

export function useConnectors() {
  const [items, setItems] = useState<ConnectorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/connectors', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load connectors');
      }
      const result = (await response.json()) as {
        connectors?: ConnectorRecord[];
      };
      setItems(result.connectors ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load connectors',
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<ConnectorRecord>) => {
    const response = await fetch('/api/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create connector');
    }

    const result = (await response.json()) as { connector?: ConnectorRecord };
    const nextItem = result.connector ?? {
      ...payload,
      name: payload.name ?? 'New connector',
      description: payload.description ?? '',
      type: payload.type ?? 'custom',
      status: payload.status ?? 'pending',
    };
    setItems((current) => [nextItem, ...current]);
    return nextItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<ConnectorRecord>) => {
      const response = await fetch(`/api/connectors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update connector');
      }

      const result = (await response.json()) as { connector?: ConnectorRecord };
      const nextItem = result.connector ?? {
        ...(payload as ConnectorRecord),
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
    const response = await fetch(`/api/connectors/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete connector');
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
