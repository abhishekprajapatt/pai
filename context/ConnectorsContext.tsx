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

export interface ConnectorRecord {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  type: string;
  status?: 'connected' | 'disconnected' | 'pending';
  config?: Record<string, any>;
  icon?: string;
  userId?: string;
}

interface ConnectorsContextValue {
  connectors: ConnectorRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createConnector: (
    input: Partial<ConnectorRecord>,
  ) => Promise<ConnectorRecord | null>;
  updateConnector: (
    id: string,
    input: Partial<ConnectorRecord>,
  ) => Promise<ConnectorRecord | null>;
  deleteConnector: (id: string) => Promise<boolean>;
}

const ConnectorsContext = createContext<ConnectorsContextValue | undefined>(
  undefined,
);

export function ConnectorsProvider({ children }: { children: ReactNode }) {
  const [connectors, setConnectors] = useState<ConnectorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connectors', {
        cache: 'force-cache',
      });
      if (!response.ok) {
        throw new Error('Unable to load connectors');
      }
      const result = (await response.json()) as {
        connectors?: ConnectorRecord[];
      };
      setConnectors(result.connectors ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load connectors',
      );
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConnector = useCallback(
    async (input: Partial<ConnectorRecord>) => {
      const payload = {
        name: input.name ?? 'New connector',
        description: input.description ?? '',
        type: input.type ?? 'generic',
        status: input.status ?? 'pending',
        config: input.config ?? {},
        icon: input.icon ?? '',
      };

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
      const nextConnector = result.connector ?? payload;
      setConnectors((current) => [nextConnector, ...current]);
      return nextConnector;
    },
    [],
  );

  const updateConnector = useCallback(
    async (id: string, input: Partial<ConnectorRecord>) => {
      const response = await fetch(`/api/connectors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to update connector');
      }

      const result = (await response.json()) as { connector?: ConnectorRecord };
      const connector = result.connector ?? {
        ...(input as ConnectorRecord),
        _id: id,
      };
      setConnectors((current) =>
        current.map((item) =>
          item._id === id || item.id === id ? connector : item,
        ),
      );
      return connector;
    },
    [],
  );

  const deleteConnector = useCallback(async (id: string) => {
    const response = await fetch(`/api/connectors/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete connector');
    }

    setConnectors((current) =>
      current.filter((item) => item._id !== id && item.id !== id),
    );
    return true;
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<ConnectorsContextValue>(
    () => ({
      connectors,
      loading,
      error,
      refresh,
      createConnector,
      updateConnector,
      deleteConnector,
    }),
    [
      connectors,
      loading,
      error,
      refresh,
      createConnector,
      updateConnector,
      deleteConnector,
    ],
  );

  return (
    <ConnectorsContext.Provider value={value}>
      {children}
    </ConnectorsContext.Provider>
  );
}

export function useConnectorsContext() {
  const context = useContext(ConnectorsContext);
  if (!context) {
    throw new Error(
      'useConnectorsContext must be used within ConnectorsProvider',
    );
  }
  return context;
}
