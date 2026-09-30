import type { Dispatch, SetStateAction } from 'react';

export interface ProjectItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  summary?: string;
  status?: 'draft' | 'active' | 'archived';
  tags?: string[];
  ownerId?: string;
  metadata?: Record<string, any>;
}

export interface ProjectSliceState {
  items: ProjectItem[];
  selected: ProjectItem | null;
  loading: boolean;
  error: string | null;
}

export type ProjectSliceAction =
  | { type: 'setItems'; value: SetStateAction<ProjectItem[]> }
  | { type: 'setSelected'; value: SetStateAction<ProjectItem | null> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialProjectSliceState: ProjectSliceState = {
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

export function projectSliceReducer(
  state: ProjectSliceState,
  action: ProjectSliceAction,
): ProjectSliceState {
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
      return initialProjectSliceState;
    default:
      return state;
  }
}

export interface ProjectSliceActions {
  setItems: Dispatch<SetStateAction<ProjectItem[]>>;
  setSelected: Dispatch<SetStateAction<ProjectItem | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
