'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface ConnectorFormValues {
  name: string;
  description: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending';
  icon: string;
}

interface ConnectorFormProps {
  initialValues?: Partial<ConnectorFormValues>;
  onSubmit?: (values: ConnectorFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

const defaultValues: ConnectorFormValues = {
  name: '',
  description: '',
  type: 'webhook',
  status: 'pending',
  icon: '',
};

export function ConnectorForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save connector',
  disabled = false,
}: ConnectorFormProps) {
  const [values, setValues] = useState<ConnectorFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
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
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Name</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Type</span>
          <input
            name="type"
            value={values.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="oauth, api, webhook"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Status</span>
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          >
            <option value="pending">Pending</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Icon URL</span>
          <input
            name="icon"
            value={values.icon}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="https://example.com/icon.png"
          />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            disabled={disabled}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
