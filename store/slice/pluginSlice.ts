import type { Dispatch, SetStateAction } from 'react';

export interface PluginItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'installed' | 'disabled' | 'pending';
  config?: Record<string, any>;
  sourceUrl?: string;
  author?: string;
  userId?: string;
}

export interface PluginSliceState {
  items: PluginItem[];
  selected: PluginItem | null;
  loading: boolean;
  error: string | null;
}

export type PluginSliceAction =
  | { type: 'setItems'; value: SetStateAction<PluginItem[]> }
  | { type: 'setSelected'; value: SetStateAction<PluginItem | null> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialPluginSliceState: PluginSliceState = {
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

export function pluginSliceReducer(
  state: PluginSliceState,
  action: PluginSliceAction,
): PluginSliceState {
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
      return initialPluginSliceState;
    default:
      return state;
  }
}

export interface PluginSliceActions {
  setItems: Dispatch<SetStateAction<PluginItem[]>>;
  setSelected: Dispatch<SetStateAction<PluginItem | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
