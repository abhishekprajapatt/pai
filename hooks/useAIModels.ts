'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CustomAIModel {
  id: string;
  provider: 'anthropic' | 'deepseek' | 'openai' | 'gemini';
  name: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export function useAIModels() {
  const [models, setModels] = useState<CustomAIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/models', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to fetch AI models');
      }
      const result = (await response.json()) as { models?: CustomAIModel[] };
      setModels(result.models ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to fetch AI models',
      );
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createModel = useCallback(
    async (payload: Omit<CustomAIModel, 'id'>) => {
      const response = await fetch('/api/user/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to save model');
      }

      const result = (await response.json()) as { model?: CustomAIModel };
      const nextModel = result.model ?? { ...payload, id: crypto.randomUUID() };
      setModels((current) => [nextModel, ...current]);
      return nextModel;
    },
    [],
  );

  const removeModel = useCallback(async (modelId: string) => {
    const response = await fetch('/api/user/models', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: modelId }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to remove model');
    }

    setModels((current) => current.filter((model) => model.id !== modelId));
    return true;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { models, loading, error, refresh, createModel, removeModel };
}
