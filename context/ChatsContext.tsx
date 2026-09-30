'use client';

import toast from 'react-hot-toast';
import axios, { type AxiosResponse } from 'axios';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useAIModelsContext } from '@/context/AIModelsContext';
import {
  chatSliceReducer,
  initialChatSliceState,
  type Chat,
  type ChatMessage as Message,
} from '@/store/slice/chatSlice';
import {
  clearTempChats,
  deleteTempChat,
  getSelectedChatId,
  getTempChats,
  saveTempChat,
  setSelectedChatId,
} from '@/lib/localStorageUtils';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ChatsContextValue {
  chats: Chat[];
  selectedChat: Chat | null;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  fetchUserChats: () => Promise<void>;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newName: string) => Promise<void>;
  generateChatTitle: (chatId: string, userQuery: string) => Promise<void>;
  renamingChatId: string | null;
  setRenamingChatId: React.Dispatch<React.SetStateAction<string | null>>;
  isWriting: boolean;
  setIsWriting: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  textUpdateTimeouts: ReturnType<typeof setTimeout>[];
  setTextUpdateTimeouts: React.Dispatch<
    React.SetStateAction<ReturnType<typeof setTimeout>[]>
  >;
  editAndResendMessage: (
    messageIndex: number,
    newContent: string,
  ) => Promise<void>;
  handleEditMessage: (messageId: string, newContent: string) => void;
  sendPrompt: (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent | null,
    customPrompt?: string,
  ) => Promise<void>;
  stopTextGeneration: () => void;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

export function ChatsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user: firebaseUser, getIdToken, isAuthenticated } = useFirebaseAuth();
  const { selectedModel } = useAIModelsContext();
  const [chatState, dispatchChat] = useReducer(
    chatSliceReducer,
    initialChatSliceState,
  );
  const { chats, selectedChat, renamingChatId, isWriting, isLoading } =
    chatState;

  const setChats = useCallback(
    (value: React.SetStateAction<Chat[]>) =>
      dispatchChat({ type: 'setChats', value }),
    [],
  );
  const setSelectedChat = useCallback(
    (value: React.SetStateAction<Chat | null>) =>
      dispatchChat({ type: 'setSelectedChat', value }),
    [],
  );
  const setRenamingChatId = useCallback(
    (value: React.SetStateAction<string | null>) =>
      dispatchChat({ type: 'setRenamingChatId', value }),
    [],
  );
  const setIsWriting = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchChat({ type: 'setIsWriting', value }),
    [],
  );
  const setIsLoading = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchChat({ type: 'setIsLoading', value }),
    [],
  );
  const [textUpdateTimeouts, setTextUpdateTimeouts] = useState<
    ReturnType<typeof setTimeout>[]
  >([]);
  const fetchInFlightRef = useRef(false);

  const fetchUserChats = useCallback(async (): Promise<void> => {
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;

    try {
      let chatsData: Chat[] = [];
      if (isAuthenticated) {
        try {
          const token = await getIdToken();
          const { data }: AxiosResponse<ApiResponse<Chat[]>> = await axios.get(
            '/api/chat/get',
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (data.success) {
            chatsData = Array.isArray(data.data) ? data.data : [];
          }
        } catch (error) {
          console.log('Error fetching chats from API:', error);
        }

        const localChats = getTempChats() as Chat[];
        const knownIds = new Set(chatsData.map((chat) => chat._id));
        chatsData = [
          ...chatsData,
          ...localChats.filter((chat) => !knownIds.has(chat._id)),
        ];
      } else {
        chatsData = (getTempChats() as Chat[]).map((chat) => ({
          ...chat,
          userId: chat.userId || 'unauthenticated',
        }));
      }

      const sortedData = [...chatsData].sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime(),
      );
      setChats(sortedData);
    } catch (error) {
      console.log('Error in fetchUserChats:', error);
    } finally {
      fetchInFlightRef.current = false;
    }
  }, [getIdToken, isAuthenticated, setChats]);

  const generateChatTitle = useCallback(
    async (chatId: string, userQuery: string): Promise<void> => {
      setRenamingChatId(chatId);
      try {
        if (!firebaseUser || !chatId) return;
        const token = await getIdToken();

        let titleSuggestion = 'New Chat';
        if (userQuery && userQuery.trim()) {
          const words = userQuery.trim().split(' ');
          titleSuggestion = words.slice(0, 5).join(' ');
          if (words.length > 5) titleSuggestion += '...';
          if (titleSuggestion.length > 40) {
            titleSuggestion = titleSuggestion.substring(0, 37) + '...';
          }
        }

        try {
          const { data }: AxiosResponse<ApiResponse> = await axios.post(
            '/api/chat/rename',
            { chatId, name: titleSuggestion },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (data.success) {
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat._id === chatId ? { ...chat, name: titleSuggestion } : chat,
              ),
            );
            if (selectedChat?._id === chatId) {
              setSelectedChat({ ...selectedChat, name: titleSuggestion });
            }
          }
        } catch (apiError) {
          console.error('Error calling rename API:', apiError);
        }
      } catch (error) {
        console.error('Error generating title:', error);
      } finally {
        setRenamingChatId(null);
      }
    },
    [
      firebaseUser,
      getIdToken,
      selectedChat,
      setChats,
      setRenamingChatId,
      setSelectedChat,
    ],
  );

  const createNewChat = useCallback(async (): Promise<void> => {
    try {
      if (selectedChat && selectedChat.messages?.length === 0) {
        toast.error(
          'Please send at least one message before creating a new chat',
        );
        return;
      }

      const tempChatId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      const tempChat: Chat = {
        _id: tempChatId,
        name: 'New Chat',
        messages: [],
        userId: firebaseUser?.uid || 'unauthenticated',
      };

      setSelectedChat(tempChat);
      setChats((prevChats) => [tempChat, ...prevChats]);
      router.push(`/chat/${tempChatId}`);
    } catch (error) {
      toast.error((error as Error).message || 'Unable to create chat');
    }
  }, [firebaseUser?.uid, router, selectedChat, setChats, setSelectedChat]);

  const deleteChat = useCallback(
    async (chatId: string): Promise<void> => {
      try {
        if (isAuthenticated && firebaseUser) {
          const token = await getIdToken();
          const { data }: AxiosResponse<ApiResponse> = await axios.delete(
            `/api/chat/delete?id=${encodeURIComponent(chatId)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (data.success) {
            await fetchUserChats();
            if (selectedChat?._id === chatId) setSelectedChat(null);
          } else {
            toast.error(data.message || 'Unable to delete chat');
          }
        } else {
          deleteTempChat(chatId);
          setChats((prevChats) =>
            prevChats.filter((chat) => chat._id !== chatId),
          );
          if (selectedChat?._id === chatId) setSelectedChat(null);
          toast.success('Chat deleted');
        }
      } catch (error) {
        toast.error((error as Error).message || 'Unable to delete chat');
      }
    },
    [
      fetchUserChats,
      firebaseUser,
      getIdToken,
      isAuthenticated,
      selectedChat?._id,
      setChats,
      setSelectedChat,
    ],
  );

  const renameChat = useCallback(
    async (chatId: string, newName: string): Promise<void> => {
      try {
        if (isAuthenticated && firebaseUser) {
          const token = await getIdToken();
          const { data }: AxiosResponse<ApiResponse> = await axios.post(
            '/api/chat/rename',
            { chatId, name: newName },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (data.success) {
            await fetchUserChats();
            if (selectedChat?._id === chatId) {
              setSelectedChat({ ...selectedChat, name: newName });
            }
          } else {
            toast.error(data.message || 'Unable to rename chat');
          }
        } else {
          const localChats = getTempChats();
          const chatIndex = localChats.findIndex((chat) => chat._id === chatId);
          if (chatIndex >= 0) {
            localChats[chatIndex].name = newName;
            saveTempChat(localChats[chatIndex]);
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat._id === chatId ? { ...chat, name: newName } : chat,
              ),
            );
            if (selectedChat?._id === chatId) {
              setSelectedChat({ ...selectedChat, name: newName });
            }
            toast.success('Chat renamed');
          }
        }
      } catch (error) {
        toast.error((error as Error).message || 'Unable to rename chat');
      }
    },
    [
      fetchUserChats,
      firebaseUser,
      getIdToken,
      isAuthenticated,
      selectedChat,
      setChats,
      setSelectedChat,
    ],
  );

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string): void => {
      if (!selectedChat) return;
      const updatedMessages = selectedChat.messages.map((msg: Message) =>
        msg.id === messageId || msg._id === messageId
          ? { ...msg, content: newContent }
          : msg,
      );

      setSelectedChat({ ...selectedChat, messages: updatedMessages });
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: updatedMessages }
            : chat,
        ),
      );
    },
    [selectedChat, setChats, setSelectedChat],
  );

  const sendPrompt = useCallback(
    async (
      e?: React.FormEvent<HTMLFormElement> | React.MouseEvent | null,
      customPrompt?: string,
    ): Promise<void> => {
      if (e) e.preventDefault();
      let finalPrompt = customPrompt !== undefined ? customPrompt : '';
      let images: string[] = [];
      const isVoiceInput = customPrompt !== undefined;

      if (
        finalPrompt.includes('"prompt"') &&
        finalPrompt.includes('"images"')
      ) {
        try {
          const parsed = JSON.parse(finalPrompt);
          finalPrompt = parsed.prompt || '';
          images = parsed.images || [];
        } catch {
          // ignore malformed payloads
        }
      }

      if (!finalPrompt.trim() && images.length === 0) {
        toast.error('Prompt is empty');
        return;
      }

      if (selectedChat && selectedChat.messages.length === 0) {
        router.push(`/chat/${selectedChat._id}`);
      }

      let chatToUse = selectedChat;
      if (!chatToUse) {
        try {
          if (isAuthenticated && firebaseUser) {
            const token = await getIdToken();
            const createResponse: AxiosResponse<ApiResponse<{ _id: string }>> =
              await axios.post(
                '/api/chat/create',
                {},
                { headers: { Authorization: `Bearer ${token}` } },
              );
            if (
              !createResponse.data.success ||
              !createResponse.data.data?._id
            ) {
              throw new Error(
                createResponse.data.message || 'Failed to create chat',
              );
            }
            chatToUse = {
              _id: createResponse.data.data._id,
              name: 'New Chat',
              messages: [],
              userId: firebaseUser.uid,
            };
          } else {
            chatToUse = {
              _id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
              name: 'New Chat',
              messages: [],
              userId: 'unauthenticated',
            };
          }

          setSelectedChat(chatToUse);
          setChats((prevChats) => [chatToUse as Chat, ...prevChats]);
          router.push(`/chat/${chatToUse._id}`);
        } catch (error) {
          console.error('Failed to create chat:', error);
          toast.error('Unable to start chat. Please try again.');
          return;
        }
      }

      const chatId = chatToUse._id;
      const userPrompt: Message = {
        role: 'user',
        content: finalPrompt,
        timestamp: Date.now(),
        isVoiceMessage: isVoiceInput,
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? { ...chat, messages: [...(chat.messages || []), userPrompt] }
            : chat,
        ),
      );

      setSelectedChat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), userPrompt],
        };
      });

      setIsWriting(true);
      setIsLoading(true);

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isVoiceMessage: isVoiceInput,
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat,
        ),
      );
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: [...prev.messages, assistantMessage] };
      });

      let fullContent = '';
      try {
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (isAuthenticated) {
          const token = await getIdToken();
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            chatId,
            prompt: finalPrompt,
            images,
            model: selectedModel,
            customModelId:
              selectedModel === 'prajapatt' ? undefined : selectedModel,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullContent += chunk;

            setSelectedChat((prev) => {
              if (!prev) return prev;
              const updatedMessages = prev.messages.map((msg, index) =>
                index === prev.messages.length - 1 && msg.role === 'assistant'
                  ? { ...msg, content: fullContent }
                  : msg,
              );
              return { ...prev, messages: updatedMessages };
            });

            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat._id === chatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg, index) =>
                        index === chat.messages.length - 1 &&
                        msg.role === 'assistant'
                          ? { ...msg, content: fullContent }
                          : msg,
                      ),
                    }
                  : chat,
              ),
            );
          }
        } finally {
          reader.releaseLock();
        }

        const finalChunk = decoder.decode();
        if (finalChunk) {
          fullContent += finalChunk;
          setSelectedChat((prev) => {
            if (!prev) return prev;
            const updatedMessages = prev.messages.map((msg, index) =>
              index === prev.messages.length - 1 && msg.role === 'assistant'
                ? { ...msg, content: fullContent }
                : msg,
            );
            return { ...prev, messages: updatedMessages };
          });
        }

        if (chatId.startsWith('temp_') && isAuthenticated && firebaseUser) {
          generateChatTitle(chatId, finalPrompt);
        }
      } catch (error) {
        console.error('API call error:', error);
        toast.error((error as Error).message || 'Failed to get response');
      } finally {
        setIsWriting(false);
        setIsLoading(false);
      }
    },
    [
      firebaseUser,
      generateChatTitle,
      getIdToken,
      isAuthenticated,
      router,
      selectedChat,
      selectedModel,
      setChats,
      setIsLoading,
      setIsWriting,
      setSelectedChat,
    ],
  );

  const stopTextGeneration = useCallback(() => {
    textUpdateTimeouts.forEach((timeout) => clearTimeout(timeout));
    setTextUpdateTimeouts([]);
    setIsWriting(false);
  }, [setIsWriting, setTextUpdateTimeouts, textUpdateTimeouts]);

  const editAndResendMessage = useCallback(
    async (messageIndex: number, newContent: string): Promise<void> => {
      if (!selectedChat) return;

      let finalPrompt = newContent;
      let images: string[] = [];

      if (
        finalPrompt.includes('"prompt"') &&
        finalPrompt.includes('"images"')
      ) {
        try {
          const parsed = JSON.parse(finalPrompt);
          finalPrompt = parsed.prompt || '';
          images = parsed.images || [];
        } catch {
          // ignore malformed payloads
        }
      }

      const truncatedMessages = selectedChat.messages.slice(
        0,
        messageIndex + 1,
      );
      truncatedMessages[messageIndex] = {
        ...truncatedMessages[messageIndex],
        content: finalPrompt,
      };

      setSelectedChat({ ...selectedChat, messages: truncatedMessages });
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: truncatedMessages }
            : chat,
        ),
      );

      try {
        setIsLoading(true);
        setIsWriting(true);

        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (isAuthenticated) {
          const token = await getIdToken();
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            chatId: selectedChat._id,
            prompt: finalPrompt,
            images,
            model: selectedModel,
            customModelId:
              selectedModel === 'prajapatt' ? undefined : selectedModel,
            isEdit: true,
            editedMessageIndex: messageIndex,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let message = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              message += decoder.decode(value, { stream: true });
            }
            message += decoder.decode();
          } finally {
            reader.releaseLock();
          }

          const finalMessage: Message = {
            role: 'assistant',
            content: message,
            timestamp: Date.now(),
          };

          setSelectedChat((prev) =>
            prev
              ? { ...prev, messages: [...truncatedMessages, finalMessage] }
              : prev,
          );
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === selectedChat._id
                ? { ...chat, messages: [...truncatedMessages, finalMessage] }
                : chat,
            ),
          );
        }
      } catch (error) {
        console.error('Failed to edit and resend message:', error);
        toast.error('Failed to edit message');
      } finally {
        setIsLoading(false);
        setIsWriting(false);
      }
    },
    [
      getIdToken,
      isAuthenticated,
      selectedChat,
      selectedModel,
      setChats,
      setIsLoading,
      setIsWriting,
      setSelectedChat,
    ],
  );

  useEffect(() => {
    if (firebaseUser || !isAuthenticated) {
      void fetchUserChats();
    }
  }, [firebaseUser, fetchUserChats, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      chats.forEach((chat) => saveTempChat(chat));
    }
  }, [chats, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      setSelectedChatId(selectedChat?._id ?? null);
    }
  }, [selectedChat, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && firebaseUser) {
      clearTempChats();
    }
  }, [firebaseUser, isAuthenticated]);

  const value = useMemo<ChatsContextValue>(
    () => ({
      chats,
      selectedChat,
      setChats,
      setSelectedChat,
      fetchUserChats,
      createNewChat,
      deleteChat,
      renameChat,
      generateChatTitle,
      renamingChatId,
      setRenamingChatId,
      isWriting,
      setIsWriting,
      isLoading,
      setIsLoading,
      textUpdateTimeouts,
      setTextUpdateTimeouts,
      editAndResendMessage,
      handleEditMessage,
      sendPrompt,
      stopTextGeneration,
    }),
    [
      chats,
      selectedChat,
      setChats,
      setSelectedChat,
      fetchUserChats,
      createNewChat,
      deleteChat,
      renameChat,
      generateChatTitle,
      renamingChatId,
      setRenamingChatId,
      isWriting,
      setIsWriting,
      isLoading,
      setIsLoading,
      textUpdateTimeouts,
      setTextUpdateTimeouts,
      editAndResendMessage,
      handleEditMessage,
      sendPrompt,
      stopTextGeneration,
    ],
  );

  return (
    <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
  );
}

export function useChatsContext() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChatsContext must be used within ChatsProvider');
  }
  return context;
}
