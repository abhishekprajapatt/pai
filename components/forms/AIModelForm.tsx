'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

export interface AIModelFormValues {
  provider: 'anthropic' | 'deepseek' | 'openai' | 'gemini';
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

interface AIModelFormProps {
  initialValues?: Partial<AIModelFormValues>;
  onSubmit?: (values: AIModelFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
  showAdvancedFields?: boolean;
}

const defaultValues: AIModelFormValues = {
  provider: 'openai',
  name: '',
  baseUrl: '',
  model: '',
  apiKey: '',
};

export function AIModelForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save model',
  disabled = false,
  showAdvancedFields = true,
}: AIModelFormProps) {
  const [values, setValues] = useState<AIModelFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setValues((current) => ({ ...current, ...initialValues }));
  }, [initialValues]);

  const providerOptions = useMemo(
    () => ['openai', 'anthropic', 'deepseek', 'gemini'],
    [],
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit) {
      return;
    }
    await onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {showAdvancedFields && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Name</span>
            <input
              name="name"
              value={values.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none ring-0 transition focus:border-slate-400"
              placeholder="My OpenAI model"
              disabled={disabled}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <span>Provider</span>
            <select
              name="provider"
              value={values.provider}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
              disabled={disabled}
            >
              {providerOptions.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Base URL</span>
            <input
              name="baseUrl"
              value={values.baseUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="https://api.openai.com/v1"
              disabled={disabled}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Model</span>
            <input
              name="model"
              value={values.model}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="gpt-4o-mini"
              disabled={disabled}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>API key</span>
            <input
              type="password"
              name="apiKey"
              value={values.apiKey}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="Enter API key"
              disabled={disabled}
              required
            />
          </label>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            disabled={disabled}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
