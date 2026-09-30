'use client';

import { useCallback, useEffect, useState } from 'react';

export interface BlogRecord {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  tags?: string[];
  category?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  featuredImage?: string;
}

export function useBlogs() {
  const [items, setItems] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blogs', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load blogs');
      }
      const result = (await response.json()) as { blogs?: BlogRecord[] };
      setItems(result.blogs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blogs');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: Partial<BlogRecord>) => {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create blog');
    }

    const result = (await response.json()) as { blog?: BlogRecord };
    const generatedSlug =
      (payload.title ?? 'untitled-blog')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'untitled-blog';
    const nextItem = result.blog ?? {
      ...payload,
      title: payload.title ?? 'Untitled blog',
      slug: payload.slug ?? generatedSlug,
      content: payload.content ?? '',
    };
    setItems((current) => [nextItem, ...current]);
    return nextItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: Partial<BlogRecord>) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update blog');
      }

      const result = (await response.json()) as { blog?: BlogRecord };
      const nextItem = result.blog ?? { ...(payload as BlogRecord), _id: id };
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
    const response = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete blog');
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
