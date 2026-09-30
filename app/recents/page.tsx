'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { assets } from '@/public/assets/assets';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import { EllipsisVertical, Search } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import ChatActionMenu from '@/components/cards/Menu';
import SearchOverlay from '@/components/shared/SearchOverlay';

const formatChatDate = (value: string | Date | undefined) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const RecentsPage: React.FC = () => {
  const {
    user: firebaseUser,
    loading: authLoading,
    isAuthenticated,
  } = useFirebaseAuth();
  const router = useRouter();

  const [expand, setExpand] = useState<boolean>(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Shared'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<{
    id: string | null;
    open: boolean;
  }>({
    id: null,
    open: false,
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { chats, deleteChat, setSelectedChat } = useAppContext() as any;

  useEffect(() => {
    setInitialLoadDone(true);
  }, []);

  useEffect(() => {
    setWelcomeMessage(
      firebaseUser
        ? `Hey ${firebaseUser?.displayName || 'there'}, here are all your recent chats.`
        : 'Here are your recent chats. Login to sync across devices.',
    );
  }, [firebaseUser]);

  const filteredChats = useMemo(
    () =>
      chats
        .filter((chat: any) => {
          if (filter === 'All') return true;
          return chat.userId !== firebaseUser?.uid;
        })
        .filter((chat: any) =>
          chat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() -
            new Date(a.updatedAt || a.createdAt || 0).getTime(),
        ),
    [chats, filter, searchQuery, firebaseUser],
  );

  const toggleSelection = (chatId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
      } else {
        next.add(chatId);
      }
      return next;
    });
    if (!selectionMode) {
      setSelectionMode(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredChats.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredChats.map((chat: any) => chat._id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    for (const chatId of Array.from(selectedIds)) {
      await deleteChat(chatId);
    }
    setSelectedIds(new Set());
    toast.success('Deleted selected chats');
  };

  const createChat = () => {
    router.push('/');
  };

  const openChat = (chat: any) => {
    setSelectedChat(chat);
    router.push(`/chat/${chat._id}`);
  };

  if (!initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {isAuthenticated && <Sidebar expand={expand} setExpand={setExpand} />}

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Chats</h1>
              <p className="mt-2 text-sm text-slate-400">{welcomeMessage}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectionMode ? (
                <>
                  <div className="flex flex-col gap-3 border-b border-white/10 pb-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-300">
                      {selectedIds.size} selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={toggleSelectAll}
                        className="rounded-md cursor-pointer border border-white/10 bg-white/5 font-serif px-4 py-2 transition hover:bg-white/10"
                      >
                        {selectedIds.size === filteredChats.length
                          ? 'Unselect all'
                          : 'Select all'}
                      </button>
                      <button
                        disabled={selectedIds.size === 0}
                        onClick={() =>
                          toast('Move to project not implemented yet')
                        }
                        className="rounded-md cursor-pointer border border-white/10 bg-white/5 font-serif px-4 py-2 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move to project
                      </button>
                      <button
                        disabled={selectedIds.size === 0}
                        onClick={handleDeleteSelected}
                        className="rounded-md cursor-pointer bg-red-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setSelectionMode(false);
                          setSelectedIds(new Set());
                        }}
                        className="rounded-md cursor-pointer border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <>
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="rounded-md cursor-pointer border border-white/10 bg-white/5 p-2 text-sm transition hover:bg-white/10"
                    >
                      <Search className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setFilterOpen((prev) => !prev)}
                      className="rounded-md cursor-pointer border border-white/10 bg-white/5 font-serif px-4 py-2 text-sm transition hover:border-white/20"
                    >
                      Filter by {filter}
                    </button>
                    {filterOpen && (
                      <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-3xl border border-white/10 bg-[#111111] p-2 shadow-xl">
                        {(['All', 'Shared'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setFilter(option);
                              setFilterOpen(false);
                            }}
                            className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectionMode((prev) => !prev)}
                      className="rounded-md cursor-pointer border border-white/10 bg-white/5 font-serif px-4 py-2 transition hover:bg-white/10"
                    >
                      {selectionMode ? 'Cancel selection' : 'Select chats'}
                    </button>
                    <button
                      onClick={createChat}
                      className="rounded-md cursor-pointer border border-white/10 bg-white/5 px-4 py-2 font-serif transition hover:bg-white/10"
                    >
                      New chat
                    </button>
                  </>
                </>
              )}
            </div>
          </div>

          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />

          <div className="shadow-xl shadow-black/20">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredChats.length === 0 ? (
                <p className="text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  No chats found.
                </p>
              ) : (
                filteredChats.map((chat: any) => {
                  const isChecked = selectedIds.has(chat._id);
                  const chatDate = formatChatDate(
                    chat.updatedAt || chat.createdAt,
                  );
                  const previewMessage =
                    chat.messages?.[chat.messages.length - 1]?.content ||
                    'No messages yet';

                  return (
                    <div
                      key={chat._id}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111214] px-2 py-1 transition hover:border-white/15 hover:bg-[#17181b]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {selectionMode && (
                            <label
                              className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition ${
                                isChecked
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-white/20 bg-transparent hover:border-white/30'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelection(chat._id)}
                                className="sr-only"
                              />

                              {isChecked && (
                                <svg
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M5 12l5 5L19 7" />
                                </svg>
                              )}
                            </label>
                          )}

                          <button
                            onClick={() => openChat(chat)}
                            className="min-w-0 text-left"
                          >
                            <div className="truncate text-base font-medium text-white">
                              {chat.name || 'Untitled chat'}
                            </div>
                          </button>
                        </div>

                        <div className="relative">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuOpen((prev) => ({
                                id: prev.id === chat._id ? null : chat._id,
                                open: prev.id !== chat._id || !prev.open,
                              }));
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/70 transition hover:border-white/10 hover:bg-white/5"
                          >
                            <EllipsisVertical size={18} />
                          </button>

                          <ChatActionMenu
                            open={menuOpen.open && menuOpen.id === chat._id}
                            onClose={() =>
                              setMenuOpen({ id: null, open: false })
                            }
                            onSelect={() => openChat(chat)}
                            onRename={() =>
                              toast('Rename action not implemented yet')
                            }
                            onDelete={async () => {
                              await deleteChat(chat._id);
                              setMenuOpen({ id: null, open: false });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentsPage;
