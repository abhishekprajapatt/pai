'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface FeedbackFormValues {
  name: string;
  email: string;
  rating: number;
  category: string;
  message: string;
}

interface FeedbackFormProps {
  onSubmit?: (values: FeedbackFormValues) => Promise<void> | void;
  submitLabel?: string;
  disabled?: boolean;
}

const defaultValues: FeedbackFormValues = {
  name: '',
  email: '',
  rating: 5,
  category: 'general',
  message: '',
};

export function FeedbackForm({
  onSubmit,
  submitLabel = 'Send feedback',
  disabled = false,
}: FeedbackFormProps) {
  const [values, setValues] = useState<FeedbackFormValues>(defaultValues);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name === 'rating' ? Number(value) : value,
    }));
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
        <label className="space-y-2 text-sm text-slate-700">
          <span>Name</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Your name"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="you@example.com"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Rating</span>
          <select
            name="rating"
            value={values.rating}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Category</span>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          >
            <option value="general">General</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="support">Support</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
          <span>Message</span>
          <textarea
            name="message"
            value={values.message}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
            placeholder="Tell us how we can improve..."
            required
          />
        </label>
      </div>

      <div className="flex justify-end">
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
