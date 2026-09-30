'use client';

import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import { useFirebaseAuth } from '@/context/AuthContext';
import {
  AIModelForm,
  type AIModelFormValues,
} from '@/components/forms/AIModelForm';

const providers = {
  anthropic: {
    name: 'Prajapatt AI',
    baseUrl: 'https://api.anthropic.com/v1',
  },
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
  openai: { name: 'ChatGPT (OpenAI)', baseUrl: 'https://api.openai.com/v1' },
  gemini: {
    name: 'Gemini (Google DeepMind)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
} as const;
type Provider = keyof typeof providers;

export default function ModelsPanel() {
  const { getIdToken } = useFirebaseAuth();
  const { customModels, addCustomModel, removeCustomModel } = useAppContext();
  const [provider, setProvider] = useState<Provider>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const discover = async () => {
    if (!apiKey.trim()) return toast.error('Enter the provider API key first');
    setLoading(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'models',
          customModel: { provider, apiKey: apiKey.trim() },
        }),
      });
      const data = (await response.json()) as {
        models?: string[];
        error?: string;
      };
      if (!response.ok || !data.models?.length)
        throw new Error(data.error || 'No models found');
      setModels(data.models);
      setSelectedModel(data.models[0]);
      toast.success(`${data.models.length} models found`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to fetch models',
      );
    } finally {
      setLoading(false);
    }
  };
  const add = async ({
    provider,
    name,
    baseUrl,
    model,
    apiKey,
  }: AIModelFormValues) => {
    if (!apiKey.trim() || !model.trim()) {
      toast.error('Enter model details before saving.');
      return;
    }

    try {
      await addCustomModel({
        provider,
        name: name.trim() || providers[provider].name,
        baseUrl: baseUrl.trim() || providers[provider].baseUrl,
        model: model.trim(),
        apiKey: apiKey.trim(),
      });
      setApiKey('');
      setModels([]);
      setSelectedModel('');
      toast.success('AI model saved');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save model',
      );
    }
  };
  return (
    <section>
      <h2 className="text-lg font-semibold">AI Models</h2>
      <p className="mt-2 text-sm text-white/50">
        Prajapatt AI is the default. Add another provider using its API key.
      </p>
      <div className="mt-6 space-y-4 rounded-xl border border-white/10 p-4">
        <div className="space-y-3">
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as Provider)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
          >
            {Object.entries(providers).map(([id, item]) => (
              <option key={id} value={id} className="bg-[#09090b]">
                {item.name}
              </option>
            ))}
          </select>
          <input
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="API key"
            type="password"
            autoComplete="off"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void discover()}
            disabled={loading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Fetching models...' : 'Fetch latest models'}
          </button>
          {models.length > 0 && (
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            >
              {models.map((model) => (
                <option key={model} value={model} className="bg-[#09090b]">
                  {model}
                </option>
              ))}
            </select>
          )}
        </div>

        <AIModelForm
          initialValues={{
            provider,
            name: providers[provider].name,
            baseUrl: providers[provider].baseUrl,
            model: selectedModel || 'gpt-4o-mini',
            apiKey: apiKey,
          }}
          submitLabel="Add model"
          onSubmit={add}
        />
      </div>
      <div className="mt-7 space-y-2">
        <h3 className="text-sm font-medium">Added models</h3>
        {customModels.length === 0 ? (
          <p className="text-sm text-white/45">No custom models added yet.</p>
        ) : (
          customModels.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between rounded-lg border border-white/10 p-3"
            >
              <div>
                <p className="text-sm">{model.name}</p>
                <p className="text-xs text-white/45">{model.model}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeCustomModel(model.id)}
                aria-label={`Remove ${model.name}`}
              >
                <Trash2 size={16} className="text-red-300" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
