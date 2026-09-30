'use client';
import Image from 'next/image';
import Link from 'next/link';
import { assets } from '@/public/assets/assets';
import Message from '@/components/chats/Message';
import Sidebar from '@/components/layout/Sidebar';
import { ChevronDown } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PromptBox from '@/components/shared/PromptBox';
import { useAppContext } from '@/context/AppContext';
import { useFirebaseAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  useEffect,
  useRef,
  useState,
  MouseEvent,
  FormEvent,
  useCallback,
} from 'react';

interface MessageType {
  _id?: string;
  role: string;
  content: string;
  isVoiceMessage?: boolean;
}

interface SelectedChat {
  _id: string;
  name: string;
  messages: MessageType[];
}

interface AppContextType {
  selectedChat: SelectedChat | null;
  chats: SelectedChat[];
  setSelectedChat: (chat: SelectedChat | null) => void;
  sendPrompt: (
    e: FormEvent<HTMLFormElement> | MouseEvent | undefined,
    prompt: string,
  ) => void;
  user: any;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isWriting: boolean;
  setIsWriting: (writing: boolean) => void;
  isClient: boolean;
}

const ChatPage: React.FC = () => {
  const [expand, setExpand] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('');
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const {
    isAuthenticated,
    loading: authLoading,
    getIdToken,
  } = useFirebaseAuth();

  const {
    selectedChat,
    chats,
    setSelectedChat,
    sendPrompt,
    user,
    isLoading,
    setIsLoading,
    isWriting,
    setIsWriting,
    isClient,
  } = useAppContext() as AppContextType;

  useEffect(() => {
    if (!isClient || authLoading || !isAuthenticated || !chatId) return;
    if (selectedChat?._id === chatId && selectedChat.messages?.length > 0) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const response = await axios.get('/api/chat/get', {
          params: { id: chatId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && response.data.success && response.data.data) {
          const chat = response.data.data as SelectedChat;
          setSelectedChat(chat);
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to load chat:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    chatId,
    getIdToken,
    isAuthenticated,
    isClient,
    selectedChat,
    setSelectedChat,
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (
      isAuthenticated &&
      (chatId?.startsWith('temp_') || chatId?.startsWith('local_'))
    ) {
      router.replace('/');
    }
  }, [authLoading, chatId, isAuthenticated, router]);

  useEffect(() => {
    if (chatId?.startsWith('temp_') && user) return;
    if (!chatId || !chats || chats.length === 0) return;
    if (selectedChat && selectedChat._id === chatId) return;
    const chat = chats.find((c) => c._id === chatId);
    if (chat) {
      setSelectedChat(chat);
    }
  }, [chatId, chats, selectedChat, setSelectedChat]);

  const getGreeting = useCallback((): string => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
      return 'Good morning 🌅';
    } else if (hours >= 12 && hours < 17) {
      return 'Good afternoon ☀️';
    } else if (hours >= 17 && hours < 21) {
      return 'Good evening 🌇';
    } else {
      return 'Good night 🌙';
    }
  }, []);

  useEffect(() => {
    setGreeting(getGreeting());
  }, [getGreeting]);

  const handleToggleExpand = (e: MouseEvent<HTMLImageElement>): void => {
    e.stopPropagation();
    setExpand((prev) => !prev);
  };

  if (!isClient || authLoading) {
    return <div className="h-screen bg-[#09090b]" />;
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated ? (
        <Sidebar expand={expand} setExpand={setExpand} />
      ) : (
        <Link
          href="/login"
          className="absolute top-6 right-6 z-10 px-4 py-2 bg-primary rounded-full cursor-pointer bg-transparent border border-gray-500 hover:border-white hover:text-white transition-all"
        >
          Get Started
        </Link>
      )}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 sm:pb-8 bg-[#09090b] [#292a2d] text-white relative">
        {isAuthenticated && (
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image
              onClick={handleToggleExpand}
              className="rotate-180 cursor-pointer"
              src={assets.menu_icon as string}
              alt="Menu"
              width={24}
              height={24}
            />
            <Image
              className="opacity-70"
              src={assets.chat_icon as string}
              alt="Chat"
              width={24}
              height={24}
            />
          </div>
        )}
        <>
          {!selectedChat ||
          !selectedChat.messages ||
          selectedChat.messages.length === 0 ? (
            <>
              <div className="flex items-center gap-3">
                <Image
                  src={assets.logo_icon as string}
                  alt="Prajapatt Logo"
                  width={40}
                  height={40}
                  className="h-14 w-14 rounded-full"
                />
                <p className="text-3xl md:text-5xl font-serif font-bold font-sans text-shadow-white">
                  {greeting}
                </p>
              </div>
              <p className="text-xs md:text-sm text-center my-2 md:my-4 mask-b-from-neutral-50">
                {user
                  ? `Hey ${user?.firstName || ''}, How can I help you today?`
                  : `How can I help you today?`}
              </p>
            </>
          ) : (
            <>
              <div className="relative flex min-h-0 flex-1 flex-col items-center justify-start w-full max-h-screen overflow-y-auto pt-16">
                {isAuthenticated && (
                  <div
                    className={`fixed top-4 ${
                      expand ? 'hidden md:left-72' : 'left-20'
                    } z-20`}
                  >
                    <button
                      type="button"
                      onClick={() => setChatMenuOpen((value) => !value)}
                      className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-sm font-semibold hover:border-gray-500/50 hover:bg-[#292a2d]"
                    >
                      {selectedChat.name}
                      <ChevronDown
                        size={16}
                        className={chatMenuOpen ? 'rotate-180' : ''}
                      />
                    </button>
                    {chatMenuOpen && (
                      <div className="mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-white/10 bg-[#151515] p-1 shadow-2xl">
                        {chats.map((chat) => (
                          <button
                            key={chat._id}
                            type="button"
                            onClick={() => {
                              setSelectedChat(chat);
                              setChatMenuOpen(false);
                              router.push(`/chat/${chat._id}`);
                            }}
                            className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${chat._id === chatId ? 'bg-white/10 text-white' : 'text-white/70'}`}
                          >
                            {chat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {selectedChat.messages.map((message, index) => (
                  <Message
                    key={message._id || index}
                    role={message.role}
                    content={message.content}
                    index={index}
                    messageId={message._id || ''}
                    expand={expand}
                    setExpand={setExpand}
                    isWriting={
                      isWriting &&
                      index === selectedChat.messages.length - 1 &&
                      message.role === 'assistant'
                    }
                    isVoiceMessage={message.isVoiceMessage}
                  />
                ))}
                {isLoading &&
                  selectedChat.messages.at(-1)?.role !== 'assistant' && (
                    <div className="flex gap-2 max-w-3xl w-full py-3">
                      <Image
                        className="h-10 w-10 p-1 border border-white/15 rounded-full shrink-0"
                        src={assets.logo_icon as string}
                        alt="Prajapatt Logo"
                        width={40}
                        height={40}
                      />
                      <div className="loader flex justify-center items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-0"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-200"></div>
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </>

        <PromptBox />
        <p className="text-xs absolute bottom-5 sm:bottom-1 text-gray-500">
          Prajapatt AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
