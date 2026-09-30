import type { Dispatch, SetStateAction } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  _id?: string;
  id?: string;
  isVoiceMessage?: boolean;
}

export interface Chat {
  _id: string;
  name: string;
  messages: ChatMessage[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSliceState {
  chats: Chat[];
  selectedChat: Chat | null;
  renamingChatId: string | null;
  isWriting: boolean;
  isLoading: boolean;
}

export type ChatSliceAction =
  | { type: 'setChats'; value: SetStateAction<Chat[]> }
  | { type: 'setSelectedChat'; value: SetStateAction<Chat | null> }
  | { type: 'setRenamingChatId'; value: SetStateAction<string | null> }
  | { type: 'setIsWriting'; value: SetStateAction<boolean> }
  | { type: 'setIsLoading'; value: SetStateAction<boolean> }
  | { type: 'resetChatState' };

export const initialChatSliceState: ChatSliceState = {
  chats: [],
  selectedChat: null,
  renamingChatId: null,
  isWriting: false,
  isLoading: false,
};

function resolveValue<T>(value: SetStateAction<T>, currentValue: T): T {
  return typeof value === 'function'
    ? (value as (previousValue: T) => T)(currentValue)
    : value;
}

export function chatSliceReducer(
  state: ChatSliceState,
  action: ChatSliceAction,
): ChatSliceState {
  switch (action.type) {
    case 'setChats':
      return { ...state, chats: resolveValue(action.value, state.chats) };
    case 'setSelectedChat':
      return {
        ...state,
        selectedChat: resolveValue(action.value, state.selectedChat),
      };
    case 'setRenamingChatId':
      return {
        ...state,
        renamingChatId: resolveValue(action.value, state.renamingChatId),
      };
    case 'setIsWriting':
      return {
        ...state,
        isWriting: resolveValue(action.value, state.isWriting),
      };
    case 'setIsLoading':
      return {
        ...state,
        isLoading: resolveValue(action.value, state.isLoading),
      };
    case 'resetChatState':
      return initialChatSliceState;
    default:
      return state;
  }
}

export interface ChatSliceActions {
  setChats: Dispatch<SetStateAction<Chat[]>>;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;
  setRenamingChatId: Dispatch<SetStateAction<string | null>>;
  setIsWriting: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}
