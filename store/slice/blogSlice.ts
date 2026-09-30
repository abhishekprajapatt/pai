import type { Dispatch, SetStateAction } from 'react';

export interface BlogItem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  category: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BlogSliceState {
  items: BlogItem[];
  selected: BlogItem | null;
  loading: boolean;
  error: string | null;
}

export type BlogSliceAction =
  | { type: 'setItems'; value: SetStateAction<BlogItem[]> }
  | { type: 'setSelected'; value: SetStateAction<BlogItem | null> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialBlogSliceState: BlogSliceState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

function resolveValue<T>(value: SetStateAction<T>, currentValue: T): T {
  return typeof value === 'function'
    ? (value as (previousValue: T) => T)(currentValue)
    : value;
}

export function blogSliceReducer(
  state: BlogSliceState,
  action: BlogSliceAction,
): BlogSliceState {
  switch (action.type) {
    case 'setItems':
      return { ...state, items: resolveValue(action.value, state.items) };
    case 'setSelected':
      return { ...state, selected: resolveValue(action.value, state.selected) };
    case 'setLoading':
      return { ...state, loading: resolveValue(action.value, state.loading) };
    case 'setError':
      return { ...state, error: resolveValue(action.value, state.error) };
    case 'reset':
      return initialBlogSliceState;
    default:
      return state;
  }
}

export interface BlogSliceActions {
  setItems: Dispatch<SetStateAction<BlogItem[]>>;
  setSelected: Dispatch<SetStateAction<BlogItem | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
