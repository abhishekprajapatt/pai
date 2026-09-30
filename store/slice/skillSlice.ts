import type { Dispatch, SetStateAction } from 'react';

export interface SkillItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  version: string;
  status: 'enabled' | 'disabled' | 'draft';
  prompt?: string;
  config?: Record<string, any>;
  author?: string;
  userId?: string;
}

export interface SkillSliceState {
  items: SkillItem[];
  selected: SkillItem | null;
  loading: boolean;
  error: string | null;
}

export type SkillSliceAction =
  | { type: 'setItems'; value: SetStateAction<SkillItem[]> }
  | { type: 'setSelected'; value: SetStateAction<SkillItem | null> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialSkillSliceState: SkillSliceState = {
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

export function skillSliceReducer(
  state: SkillSliceState,
  action: SkillSliceAction,
): SkillSliceState {
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
      return initialSkillSliceState;
    default:
      return state;
  }
}

export interface SkillSliceActions {
  setItems: Dispatch<SetStateAction<SkillItem[]>>;
  setSelected: Dispatch<SetStateAction<SkillItem | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
