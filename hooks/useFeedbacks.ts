'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FeedbackRecord {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  rating: number;
  category: string;
  message: string;
  createdAt?: Date | string;
}

export function useFeedbacks() {
  const [items, setItems] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/feedbacks', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load feedback');
      }
      const result = (await response.json()) as {
        feedbacks?: FeedbackRecord[];
      };
      setItems(result.feedbacks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load feedback');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (payload: Omit<FeedbackRecord, '_id' | 'id'>) => {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to send feedback');
      }

      const result = (await response.json()) as { feedback?: FeedbackRecord };
      const nextItem = result.feedback ?? {
        ...payload,
        _id: crypto.randomUUID(),
      };
      setItems((current) => [nextItem, ...current]);
      return nextItem;
    },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh, create };
}
