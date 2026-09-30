'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface BlogFormValues {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  status: 'draft' | 'published' | 'archived';
}

interface BlogFormProps {
  initialValues?: Partial<BlogFormValues>;
  onSubmit?: (values: BlogFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

const defaultValues: BlogFormValues = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: 'General',
  tags: '',
  status: 'draft',
};

export function BlogForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save blog',
  disabled = false,
}: BlogFormProps) {
  const [values, setValues] = useState<BlogFormValues>({
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
          <span>Title</span>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Slug</span>
          <input
            name="slug"
            value={values.slug}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="product-launch-guide"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Category</span>
          <input
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Summary</span>
          <textarea
            name="summary"
            value={values.summary}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Content</span>
          <textarea
            name="content"
            value={values.content}
            onChange={handleChange}
            rows={8}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            required
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Tags</span>
          <input
            name="tags"
            value={values.tags}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="ai, automation, startup"
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
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
