import Image from 'next/image';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { assets } from '@/public/assets/assets';
import { useRouter } from 'next/navigation';
import axios, { AxiosResponse } from 'axios';
import { useAppContext } from '@/context/AppContext';
import { useFirebaseAuth } from '@/context/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import ChatActionMenu from '@/components/cards/Menu';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  _id?: string;
  id?: string;
}

interface Chat {
  _id: string;
  name: string;
  messages: ChatMessage[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

interface OpenMenu {
  id: string | number;
  open: boolean;
}

interface ChatLabelProps {
  id: string;
  name: string;
  openMenu: OpenMenu;
  setOpenMenu: (menu: OpenMenu) => void;
}

const ChatLabel: React.FC<ChatLabelProps> = ({
  id,
  name,
  openMenu,
  setOpenMenu,
}) => {
  const router = useRouter();
  const {
    fetchUserChats,
    chats,
    setSelectedChat,
    selectedChat,
    generateChatTitle,
    renamingChatId,
    setRenamingChatId,
  } = useAppContext();
  const { getIdToken } = useFirebaseAuth();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>(name);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const isSelected = selectedChat && selectedChat._id === id;
  const menuRef = useRef<HTMLDivElement>(null);
  const titleGenerationStarted = useRef(false);

  useEffect(() => {
    const autoGenerateTitle = async (): Promise<void> => {
      if (name === 'New Chat' && !titleGenerationStarted.current) {
        const chatData: Chat | undefined = chats.find(
          (chat: Chat) => chat._id === id,
        );

        if (chatData && chatData.messages && chatData.messages.length > 0) {
          const userMessage: ChatMessage | undefined = chatData.messages.find(
            (msg: ChatMessage) => msg.role === 'user',
          );

          if (userMessage && userMessage.content) {
            titleGenerationStarted.current = true;
            await generateChatTitle(id, userMessage.content);
          }
        }
      }
    };

    autoGenerateTitle();
  }, [id, name, chats, generateChatTitle]);

  useEffect(() => {
    const handleClickOutside = (event: Event): void => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        openMenu.id === id &&
        openMenu.open
      ) {
        setOpenMenu({ id: 0, open: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu, id, setOpenMenu]);

  const selectChat = (e?: React.MouseEvent<HTMLDivElement>): void => {
    e?.preventDefault();
    const chatData: Chat | undefined = chats.find(
      (chat: Chat) => chat._id === id,
    );
    if (chatData) {
      setSelectedChat(chatData);
      router.push(`/chat/${id}`);
    }
    console.log(chatData);
  };

  const renameHandler = async (): Promise<void> => {
    try {
      const token = await getIdToken();
      console.log(
        '[ChatLabel] Token for rename:',
        token ? 'Present' : 'Missing',
        token?.substring(0, 20) + '...',
      );

      const response: AxiosResponse<ApiResponse> = await axios.post(
        '/api/chat/rename',
        {
          chatId: id,
          name: renameInput,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const { data } = response;
      if (data.success) {
        fetchUserChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message || 'Chat renamed successfully');
      } else {
        toast.error(data.message || 'Failed to rename chat');
      }
    } catch (error: any) {
      console.error('[ChatLabel] Rename error:', error);
      console.error('[ChatLabel] Error response:', error.response?.data);
      console.error('[ChatLabel] Error status:', error.response?.status);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Rename failed',
      );
    } finally {
      setShowRenameModal(false);
    }
  };

  const deleteHandler = async (): Promise<void> => {
    try {
      const token = await getIdToken();
      console.log(
        '[ChatLabel] Token for delete:',
        token ? 'Present' : 'Missing',
        token?.substring(0, 20) + '...',
      );

      const response: AxiosResponse<ApiResponse> = await axios.post(
        '/api/chat/delete',
        { chatId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const { data } = response;
      if (data.success) {
        fetchUserChats();
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message || 'Chat deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete chat');
      }
    } catch (error: any) {
      console.error('[ChatLabel] Delete error:', error);
      console.error('[ChatLabel] Error response:', error.response?.data);
      console.error('[ChatLabel] Error status:', error.response?.status);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Delete failed',
      );
    } finally {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    document.title = selectedChat?.name || 'Prajapatt AI';
  }, [selectedChat]);

  return (
    <>
      <div
        onClick={selectChat}
        className={`group relative my-0.5 flex items-center justify-between rounded-xl border px-2 py-1 text-sm text-white/80 transition ${
          isSelected
            ? 'border-transparent bg-white/10 text-white'
            : 'border-transparent hover:bg-white/5'
        } cursor-pointer`}
      >
        <p className="min-w-0 truncate font-normal text-white/90">{name}</p>

        {renamingChatId === id ? (
          <div className="flex items-center justify-center font-bold text-white">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        ) : (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const menuWidth = 256;
                const menuHeight = 360;
                const left = Math.max(
                  12,
                  Math.min(
                    rect.right - menuWidth + 12,
                    window.innerWidth - menuWidth - 8,
                  ),
                );
                const top =
                  rect.bottom + menuHeight > window.innerHeight
                    ? Math.max(8, rect.top - menuHeight)
                    : rect.bottom + 8;
                setMenuPosition({ top, left });
                setOpenMenu({ id: id, open: !openMenu.open });
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-white/70 opacity-0 transition group-hover:opacity-100 hover:border-white/10 hover:bg-black/20 ${
                isSelected ? 'opacity-100' : ''
              }`}
              aria-label="Open chat actions"
            >
              <Image
                src={assets.three_dots as string}
                alt="Menu"
                width={18}
                height={18}
                className={`w-4 ${
                  openMenu.id === id && openMenu.open
                    ? 'opacity-100'
                    : 'opacity-80'
                }`}
              />
            </button>

            <ChatActionMenu
              open={openMenu.id === id && openMenu.open}
              position={menuPosition}
              onClose={() => setOpenMenu({ id: 0, open: false })}
              onSelect={() => selectChat()}
              onArchive={() => toast.success('Chat archived')}
              onRename={() => setShowRenameModal(true)}
              onAddToProject={(projectName) =>
                toast.success(
                  projectName
                    ? `Chat added to ${projectName}`
                    : 'Add to project',
                )
              }
              onMoveToGroup={(groupName) =>
                toast.success(
                  groupName ? `Chat moved to ${groupName}` : 'Move to group',
                )
              }
              onDelete={() => setShowDeleteModal(true)}
            />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div
          onClick={() => setShowDeleteModal(false)}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        >
          <div
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
            className="flex flex-col gap-6 bg-[#1e1e1e] p-6 rounded-xl w-full max-w-md shadow-lg text-white"
          >
            <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
              Delete chat?
            </h2>
            <p className="mb-6">
              This will delete <span className="font-bold">{name}</span>.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600 cursor-pointer px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={deleteHandler}
                className="bg-red-800 hover:bg-red-700 px-4 py-2 cursor-pointer rounded-lg border-2 border-red-800 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenameModal && (
        <div
          onClick={() => setShowRenameModal(false)}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        >
          <div
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
            className="flex flex-col gap-6 bg-[#1e1e1e] p-6 rounded-xl w-full max-w-md shadow-lg text-white"
          >
            <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
              Rename chat
            </h2>
            <textarea
              value={renameInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRenameInput(e.target.value)
              }
              className="w-full px-4 py-2 text-white border border-white/20 rounded-lg mb-6 outline-none resize-none"
              rows={3}
              placeholder="Enter new name"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameInput(name);
                }}
                className="bg-gray-700 hover:bg-gray-600 cursor-pointer px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={renameHandler}
                className="bg-blue-800 hover:bg-blue-700 px-4 py-2 cursor-pointer rounded-lg border-2 border-blue-800 text-white disabled:opacity-50"
                disabled={!renameInput.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatLabel;
