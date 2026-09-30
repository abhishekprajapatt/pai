import type { Dispatch, SetStateAction } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  authProvider?: string;
}

export interface UserSliceState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export type UserSliceAction =
  | { type: 'setProfile'; value: SetStateAction<UserProfile | null> }
  | { type: 'setAuthenticated'; value: SetStateAction<boolean> }
  | { type: 'setLoading'; value: SetStateAction<boolean> }
  | { type: 'setError'; value: SetStateAction<string | null> }
  | { type: 'reset' };

export const initialUserSliceState: UserSliceState = {
  profile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

function resolveValue<T>(value: SetStateAction<T>, currentValue: T): T {
  return typeof value === 'function'
    ? (value as (previousValue: T) => T)(currentValue)
    : value;
}

export function userSliceReducer(
  state: UserSliceState,
  action: UserSliceAction,
): UserSliceState {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profile: resolveValue(action.value, state.profile) };
    case 'setAuthenticated':
      return {
        ...state,
        isAuthenticated: resolveValue(action.value, state.isAuthenticated),
      };
    case 'setLoading':
      return { ...state, loading: resolveValue(action.value, state.loading) };
    case 'setError':
      return { ...state, error: resolveValue(action.value, state.error) };
    case 'reset':
      return initialUserSliceState;
    default:
      return state;
  }
}

export interface UserSliceActions {
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  setAuthenticated: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
}
