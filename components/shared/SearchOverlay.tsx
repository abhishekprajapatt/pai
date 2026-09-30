'use client';

import {
  Search,
  X,
  MessageSquareText,
  FolderClosed,
  EllipsisVertical,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useProjectsContext } from '@/context/ProjectsContext';
import ChatActionMenu from '@/components/cards/Menu';

interface SearchItem {
  id: string;
  title: string;
  type: 'chat' | 'project';
  updatedAt?: string | Date;
  route: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const formatResultDate = (value?: string | Date) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    if (diffMinutes === 0) return 'Just now';
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Past week';
  if (diffDays < 30) return 'Past month';
  return 'Past year';
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const { chats, setSelectedChat, deleteChat } = useAppContext() as any;
  const { projects: projectRecords, deleteProject } = useProjectsContext();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState<{
    id: string | null;
    open: boolean;
  }>({
    id: null,
    open: false,
  });

  const projects = useMemo(
    () =>
      (projectRecords || []).map((project: any) => ({
        id: project._id ?? project.id,
        name: project.name || 'Untitled project',
        updatedAt: project.metadata?.updatedAt,
      })),
    [projectRecords],
  );

  const items = useMemo<SearchItem[]>(() => {
    const projectItems = (projects || []).map((project: any) => ({
      id: project.id,
      title: project.name || 'Untitled project',
      type: 'project' as const,
      updatedAt: project.updatedAt,
      route: `/projects/${project.id}`,
    }));

    const chatItems = (chats || []).map((chat: any) => ({
      id: chat._id,
      title: chat.name || 'Untitled chat',
      type: 'chat' as const,
      updatedAt: chat.updatedAt || chat.createdAt,
      route: `/chat/${chat._id}`,
    }));

    return [...projectItems, ...chatItems].sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime(),
    );
  }, [chats, projects]);

  const filteredItems = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return items;
    return items.filter((item) => item.title.toLowerCase().includes(text));
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[1.5rem] border border-white/10 bg-black  shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 text-white/80">
          <Search size={18} className="text-white/70" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats and projects"
            className="w-full bg-transparent text-[1.1rem] text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[560px] overflow-y-auto px-2 py-2">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-6 text-sm text-white/45">
              No chats or projects found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon =
                item.type === 'project' ? FolderClosed : MessageSquareText;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`relative flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition ${
                    item.type === 'project'
                      ? 'hover:bg-white/5'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === 'chat') {
                        const chat = (chats || []).find(
                          (entry: any) => entry._id === item.id,
                        );
                        if (chat) {
                          setSelectedChat(chat);
                        }
                      }
                      onClose();
                      window.location.href = item.route;
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate text-[1.08rem] font-medium text-white/90">
                      {item.title}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-sm text-white/40">
                      {formatResultDate(item.updatedAt)}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpen((prev) => ({
                            id: prev.id === item.id ? null : item.id,
                            open: prev.id !== item.id || !prev.open,
                          }));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/70 transition hover:border-white/10 hover:bg-white/5"
                        aria-label={`Open ${item.title} actions`}
                      >
                        <EllipsisVertical size={18} />
                      </button>

                      <ChatActionMenu
                        open={menuOpen.open && menuOpen.id === item.id}
                        onClose={() => setMenuOpen({ id: null, open: false })}
                        onSelect={() => {
                          onClose();
                          window.location.href = item.route;
                        }}
                        onRename={() => {
                          if (item.type === 'chat') {
                            window.alert('Rename action not implemented yet');
                          }
                        }}
                        onDelete={async () => {
                          if (item.type === 'chat') {
                            await deleteChat(item.id);
                          } else if (item.id) {
                            await deleteProject(item.id);
                          }
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
  );
};

export default SearchOverlay;
