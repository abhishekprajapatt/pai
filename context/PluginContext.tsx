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
  userId?: string;
}

interface PluginContextValue {
  plugins: PluginRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createPlugin: (input: Partial<PluginRecord>) => Promise<PluginRecord | null>;
  updatePlugin: (
    id: string,
    input: Partial<PluginRecord>,
  ) => Promise<PluginRecord | null>;
  deletePlugin: (id: string) => Promise<boolean>;
}

const PluginContext = createContext<PluginContextValue | undefined>(undefined);

export function PluginProvider({ children }: { children: ReactNode }) {
  const [plugins, setPlugins] = useState<PluginRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plugins', {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error('Unable to load plugins');
      }
      const result = (await response.json()) as { plugins?: PluginRecord[] };
      setPlugins(result.plugins ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load plugins');
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlugin = useCallback(async (input: Partial<PluginRecord>) => {
    const payload = {
      name: input.name ?? 'New plugin',
      description: input.description ?? '',
      category: input.category ?? 'General',
      version: input.version ?? '1.0.0',
      status: input.status ?? 'installed',
      config: input.config ?? {},
      sourceUrl: input.sourceUrl ?? '',
      author: input.author ?? 'Prajapatt AI',
    };

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
    const nextPlugin = result.plugin ?? payload;
    setPlugins((current) => [nextPlugin, ...current]);
    return nextPlugin;
  }, []);

  const updatePlugin = useCallback(
    async (id: string, input: Partial<PluginRecord>) => {
      const response = await fetch(`/api/plugins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update plugin');
      }

      const result = (await response.json()) as { plugin?: PluginRecord };
      const plugin = result.plugin ?? { ...(input as PluginRecord), _id: id };
      setPlugins((current) =>
        current.map((item) =>
          item._id === id || item.id === id ? plugin : item,
        ),
      );
      return plugin;
    },
    [],
  );

  const deletePlugin = useCallback(async (id: string) => {
    const response = await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete plugin');
    }

    setPlugins((current) =>
      current.filter((item) => item._id !== id && item.id !== id),
    );
    return true;
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<PluginContextValue>(
    () => ({
      plugins,
      loading,
      error,
      refresh,
      createPlugin,
      updatePlugin,
      deletePlugin,
    }),
    [
      plugins,
      loading,
      error,
      refresh,
      createPlugin,
      updatePlugin,
      deletePlugin,
    ],
  );

  return (
    <PluginContext.Provider value={value}>{children}</PluginContext.Provider>
  );
}

export function usePluginContext() {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginContext must be used within PluginProvider');
  }
  return context;
}
