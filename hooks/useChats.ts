'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isVoiceMessage?: boolean;
  _id?: string;
}

export interface ChatRecord {
  _id: string;
  name: string;
  messages: ChatMessage[];
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function useChats() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load chats');
      }
      const result = (await response.json()) as { chats?: ChatRecord[] };
      setChats(result.chats ?? []);
      if (result.chats?.length) {
        setSelectedChat((current) => current ?? result.chats![0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChat = useCallback(async (name = 'New chat') => {
    const response = await fetch('/api/chat/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to create chat');
    }

    const result = (await response.json()) as { chat?: ChatRecord };
    const nextChat = result.chat ?? {
      _id: crypto.randomUUID(),
      name,
      messages: [],
      userId: 'local',
    };

    setChats((current) => [nextChat, ...current]);
    setSelectedChat(nextChat);
    return nextChat;
  }, []);

  const renameChat = useCallback(async (chatId: string, newName: string) => {
    const response = await fetch('/api/chat/rename', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, newName }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to rename chat');
    }

    setChats((current) =>
      current.map((chat) =>
        chat._id === chatId ? { ...chat, name: newName } : chat,
      ),
    );
    setSelectedChat((current) =>
      current && current._id === chatId
        ? { ...current, name: newName }
        : current,
    );
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    const response = await fetch('/api/chat/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Unable to delete chat');
    }

    setChats((current) => current.filter((chat) => chat._id !== chatId));
    setSelectedChat((current) => (current?._id === chatId ? null : current));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      chats,
      selectedChat,
      setSelectedChat,
      loading,
      error,
      refresh,
      createChat,
      renameChat,
      deleteChat,
    }),
    [
      chats,
      selectedChat,
      loading,
      error,
      refresh,
      createChat,
      renameChat,
      deleteChat,
    ],
  );
}
