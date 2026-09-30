'use client';

import { useState, type FormEvent } from 'react';

export interface AuthFormValues {
  email: string;
  password: string;
  name?: string;
}

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onSubmit?: (values: AuthFormValues) => Promise<void> | void;
  loading?: boolean;
  onGoogleClick?: () => void;
}

export function AuthForm({
  mode = 'signin',
  onSubmit,
  loading = false,
  onGoogleClick,
}: AuthFormProps) {
  const [values, setValues] = useState<AuthFormValues>({
    email: '',
    password: '',
    name: '',
  });

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
      className="space-y-4 p-5 shadow-sm"
    >
      {mode != 'signup' ? (
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Full name</span>
          <input
            type="text"
            value={values.name ?? ''}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 outline-none transition focus:border-slate-400"
            placeholder="Jane Doe"
          />
        </label>
      ) : null}

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Email</span>
        <input
          type="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Password</span>
        <input
          type="password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-slate-400"
          placeholder="••••••••"
          required
        />
      </label>

      <div className="space-y-3">
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </div>
    </form>
  );
}
