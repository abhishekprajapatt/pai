import type { Dispatch, SetStateAction } from 'react';

export interface ConnectorItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending';
  config?: Record<string, any>;
  icon?: string;
  userId?: string;
}

export interface ConnectorSliceState {
  items: ConnectorItem[];
  selected: ConnectorItem | null;
  loading: boolean;
  error: string | null;
}

export type ConnectorSliceAction =
  | { type: 'setItems'; value: SetStateAction<ConnectorItem[]> }
  | { type: 'setSelected'; value: SetStateAction<ConnectorItem | null> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialConnectorSliceState: ConnectorSliceState = {
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

export function connectorSliceReducer(
  state: ConnectorSliceState,
  action: ConnectorSliceAction,
): ConnectorSliceState {
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
      return initialConnectorSliceState;
    default:
      return state;
  }
}

export interface ConnectorSliceActions {
  setItems: Dispatch<SetStateAction<ConnectorItem[]>>;
  setSelected: Dispatch<SetStateAction<ConnectorItem | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
