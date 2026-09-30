'use client';

import { assets } from '@/public/assets/assets';
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
import { useFirebaseAuth } from '@/context/AuthContext';

export interface CustomAIModel {
  id: string;
  provider: 'anthropic' | 'deepseek' | 'openai' | 'gemini';
  name: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

interface AIModelsContextValue {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  availableModels: Array<{
    id: string;
    name: string;
    image: string | typeof assets.logo_icon;
  }>;
  customModels: CustomAIModel[];
  loading: boolean;
  error: string | null;
  refreshCustomModels: () => Promise<void>;
  addCustomModel: (model: Omit<CustomAIModel, 'id'>) => Promise<void>;
  removeCustomModel: (modelId: string) => Promise<void>;
}

const AIModelsContext = createContext<AIModelsContextValue | undefined>(
  undefined,
);

export function AIModelsProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, getIdToken, isAuthenticated } = useFirebaseAuth();
  const [selectedModel, setSelectedModel] = useState<string>('prajapatt');
  const [customModels, setCustomModels] = useState<CustomAIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const refreshCustomModels = useCallback(async () => {
    if (!firebaseUser?.uid || !isAuthenticated) {
      setCustomModels([]);
      setSelectedModel('prajapatt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch('/api/user/models', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error('Failed to load AI models');
      }

      const data = (await response.json()) as { models?: CustomAIModel[] };
      setCustomModels(data.models || []);
      setSelectedModel('prajapatt');
    } catch (err) {
      console.error('Failed to load saved AI models:', err);
      setCustomModels([]);
      setSelectedModel('prajapatt');
      setError(err instanceof Error ? err.message : 'Failed to load AI models');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser?.uid, getIdToken, isAuthenticated]);

  const addCustomModel = useCallback(
    async (model: Omit<CustomAIModel, 'id'>) => {
      const token = await getIdToken();
      const response = await fetch('/api/user/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        throw new Error('Failed to save AI model');
      }

      const data = (await response.json()) as { model: CustomAIModel };
      setCustomModels((previous) => [...previous, data.model]);
    },
    [getIdToken],
  );

  const removeCustomModel = useCallback(
    async (modelId: string) => {
      const token = await getIdToken();
      const response = await fetch('/api/user/models', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: modelId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete AI model');
      }

      setCustomModels((previous) =>
        previous.filter((model) => model.id !== modelId),
      );
      if (selectedModel === modelId) {
        setSelectedModel('prajapatt');
      }
    },
    [getIdToken, selectedModel],
  );

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void refreshCustomModels();
  }, [refreshCustomModels]);

  const availableModels = useMemo(
    () => [
      {
        id: 'prajapatt',
        name: 'Prajapatt AI',
        image: assets.pai_logo,
      },
      ...customModels.map((model) => ({
        id: model.id,
        name: model.name,
        image: assets.logo_icon,
      })),
    ],
    [customModels],
  );

  const value = useMemo<AIModelsContextValue>(
    () => ({
      selectedModel,
      setSelectedModel,
      availableModels,
      customModels,
      loading,
      error,
      refreshCustomModels,
      addCustomModel,
      removeCustomModel,
    }),
    [
      selectedModel,
      availableModels,
      customModels,
      loading,
      error,
      refreshCustomModels,
      addCustomModel,
      removeCustomModel,
    ],
  );

  return (
    <AIModelsContext.Provider value={value}>
      {children}
    </AIModelsContext.Provider>
  );
}

export function useAIModelsContext() {
  const context = useContext(AIModelsContext);
  if (!context) {
    throw new Error('useAIModelsContext must be used within AIModelsProvider');
  }
  return context;
}
