import { assets } from '@/public/assets/assets';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  IoSettingsSharp,
  IoAdd,
  IoChatbubbles,
  IoFolderOpen,
  IoLayers,
  IoColorPalette,
} from 'react-icons/io5';
import { useFirebaseAuth } from '@/context/AuthContext';
import React, { useEffect, useMemo, useState, MouseEvent, useRef } from 'react';
import { FaInstagram, FaDownload, FaLinkedin } from 'react-icons/fa6';
import { GrSend } from 'react-icons/gr';
import { MdLogout } from 'react-icons/md';
import {
  ChevronDown,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Search,
} from 'lucide-react';
import ChatLabel from '@/components/chats/ChatLabel';
import SearchOverlay from '@/components/shared/SearchOverlay';
import ProjectLabel from '@/components/projects/ProjectLabel';
import { getTranslation } from '@/lib/translations';
import { FaReddit, FaDiscord } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';
import { useProjectsContext } from '@/context/ProjectsContext';
import SettingsModal from '@/components/settings/Settings';
import toast from 'react-hot-toast';

interface Chat {
  _id: string;
  name: string;
  updatedAt: Date | string | undefined;
  messages?: any[];
}

interface OpenMenu {
  id: number | string;
  open: boolean;
}

interface GroupedChats {
  recent: Chat[];
  today: Chat[];
  yesterday: Chat[];
  previousWeek: Chat[];
  previousMonth: Chat[];
  older: Chat[];
}

interface AppContextType {
  user: any;
  chats: Chat[];
  fetchUserChats: () => Promise<void>;
  selectedChat: Chat | null;
  isClient: boolean;
  setSelectedChat: (chat: Chat | null) => void;
  detectedLang: string;
}

interface SidebarProps {
  expand: boolean;
  setExpand: (expand: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expand, setExpand }) => {
  const { signOut } = useFirebaseAuth();
  const { projects: projectRecords } = useProjectsContext();
  const router = useRouter();
  const {
    user,
    chats,
    fetchUserChats,
    selectedChat,
    isClient,
    setSelectedChat,
    detectedLang,
  } = useAppContext() as AppContextType;
  const [openMenu, setOpenMenu] = useState<OpenMenu>({ id: 0, open: false });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [userMenuPosition, setUserMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({
    recent: [],
    today: [],
    yesterday: [],
    previousWeek: [],
    previousMonth: [],
    older: [],
  });
  const groupedProjects = useMemo(() => {
    const grouped = {
      recent: [],
      today: [],
      yesterday: [],
      previousWeek: [],
      previousMonth: [],
      older: [],
    } as GroupedChats;

    if (!projectRecords.length) return grouped;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousMonthStart = new Date(today);
    previousMonthStart.setDate(previousMonthStart.getDate() - 30);

    projectRecords.forEach((project) => {
      const rawDate = project.metadata?.updatedAt ?? new Date().toISOString();
      const timestamp =
        typeof rawDate === 'string' && !Number.isNaN(Date.parse(rawDate))
          ? new Date(rawDate)
          : new Date();

      const projectId = project._id ?? project.id ?? '';
      const projectName = project.name || 'Untitled project';

      if (timestamp >= oneHourAgo) {
        grouped.recent.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      } else if (timestamp >= today) {
        grouped.today.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      } else if (timestamp >= yesterday) {
        grouped.yesterday.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      } else if (timestamp >= previousWeekStart) {
        grouped.previousWeek.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      } else if (timestamp >= previousMonthStart) {
        grouped.previousMonth.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      } else {
        grouped.older.push({
          _id: projectId,
          name: projectName,
          updatedAt: timestamp,
          messages: [],
        });
      }
    });

    return grouped;
  }, [projectRecords]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleUserMenu = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 256;
    const menuHeight = 500;
    const gap = 8;

    setUserMenuPosition({
      top: Math.max(
        8,
        Math.min(rect.bottom - menuHeight, window.innerHeight - menuHeight - 8),
      ),
      left: expand
        ? Math.max(8, rect.left - menuWidth + rect.width)
        : Math.min(rect.right + gap, window.innerWidth - menuWidth - 8),
    });
    setShowUserMenu((value) => !value);
  };

  const handleNewChatClickWithCheck = (
    e: MouseEvent<HTMLButtonElement>,
  ): void => {
    e.stopPropagation();
    handleNewChatClick(e);
  };

  useEffect(() => {
    if (chats && chats.length > 0) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const previousWeekStart = new Date(today);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousMonthStart = new Date(today);
      previousMonthStart.setDate(previousMonthStart.getDate() - 30);

      const grouped: GroupedChats = {
        recent: [],
        today: [],
        yesterday: [],
        previousWeek: [],
        previousMonth: [],
        older: [],
      };

      chats
        .filter((chat: Chat) => {
          const isLocalChat =
            chat._id.startsWith('temp_') ||
            chat._id.startsWith('local_') ||
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              chat._id,
            );
          return (
            !isLocalChat || Boolean(chat.messages && chat.messages.length > 0)
          );
        })
        .forEach((chat: Chat) => {
          const chatDate = new Date(chat.updatedAt || new Date());
          if (chatDate >= oneHourAgo) {
            grouped.recent.push(chat);
          } else if (chatDate >= today) {
            grouped.today.push(chat);
          } else if (chatDate >= yesterday) {
            grouped.yesterday.push(chat);
          } else if (chatDate >= previousWeekStart) {
            grouped.previousWeek.push(chat);
          } else if (chatDate >= previousMonthStart) {
            grouped.previousMonth.push(chat);
          } else {
            grouped.older.push(chat);
          }
        });

      setGroupedChats(grouped);
    }
  }, [chats]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener(
        'mousedown',
        handleClickOutside as EventListener,
      );
      return () => {
        document.removeEventListener(
          'mousedown',
          handleClickOutside as EventListener,
        );
      };
    }
  }, [showUserMenu]);

  const handleCreateNewChat = async (): Promise<void> => {
    setSelectedChat(null);
    await fetchUserChats();
    router.push('/');
  };

  const sidebarMenuItems = [
    {
      id: 'new-chat',
      label: 'New chat',
      icon: IoAdd,
      action: handleCreateNewChat,
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: IoChatbubbles,
      action: () => router.push('/recents'),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: IoFolderOpen,
      action: () => router.push('/projects'),
    },
    {
      id: 'artifacts',
      label: 'Artifacts',
      icon: IoLayers,
      action: () => router.push('/artifacts'),
    },
    {
      id: 'customize',
      label: 'Customize',
      icon: IoColorPalette,
      action: () => router.push('/customize/skills'),
    },
  ];

  const renderChatGroup = (chats: Chat[], title: string): React.ReactNode => {
    if (!chats || chats.length === 0) return null;

    return (
      <div className="mb-4">
        <p className="text-white/25 my-1 text-xs">{title}</p>
        {chats.map((chat) => (
          <ChatLabel
            key={chat._id}
            name={chat.name}
            id={chat._id}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        ))}
      </div>
    );
  };

  const renderProjectGroup = (
    items: Chat[],
    title: string,
  ): React.ReactNode => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-3">
        <p className="text-white/25 my-1 text-xs">{title}</p>
        {items.map((project) => (
          <ProjectLabel
            key={project._id}
            id={project._id}
            name={project.name}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
          />
        ))}
      </div>
    );
  };

  const handleToggleSidebar = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    setExpand(!expand);
  };

  const handleNewChatClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    setSelectedChat(null);
    void fetchUserChats();
    router.push('/');
  };

  return (
    <div
      className={`relative flex flex-col border-r border-white/10 bg-[#070707] [#212327] pt-7 transition-all z-50 max-md:absolute max-md:h-screen ${
        expand ? 'p-4 w-64' : 'md:w-12 w-0 max-md:overflow-hidden'
      }`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex mb-4 ${
            expand ? 'flex-row gap-10' : 'flex-col items-center gap-8'
          }`}
        >
          <div
            onClick={expand ? () => router.push('/') : handleToggleSidebar}
            className={`relative flex items-center justify-center ${
              expand ? 'cursor-pointer' : 'group h-9 w-9 cursor-pointer'
            }`}
            aria-label={expand ? 'Go to home' : 'Open sidebar'}
          >
            <Image
              src={assets.logo_icon as string}
              alt="Prajapatt Logo"
              width={expand ? 144 : 32}
              height={32}
              className={
                expand
                  ? 'w-9'
                  : 'h-9 w-9 rounded-lg transition-opacity group-hover:opacity-25'
              }
            />
            {!expand && (
              <Image
                src={assets.sidebar_icon as string}
                alt="Open sidebar"
                width={28}
                height={28}
                className="pointer-events-none absolute inset-1/2 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 group-hover:block"
              />
            )}
            {expand && <h1 className="font-bold font-black">Prajapatt</h1>}
          </div>{' '}
          {expand && (
            <div
              onClick={handleToggleSidebar}
              className="group relative ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-500/40"
              aria-label="Close sidebar"
            >
              <Image
                src={assets.sidebar_close_icon as string}
                alt="Close sidebar"
                width={28}
                height={28}
                className="w-7"
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className={`flex items-center gap-3 w-full text-left text-sm text-white/80 px-2 py-1 cursor-pointer rounded-full transition hover:bg-white/10 ${
                  expand ? 'justify-start' : 'justify-center'
                }`}
              >
                <Icon size={18} />
                {expand && <span className="font-head">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="relative">
            {expand ? (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder={getTranslation(
                    detectedLang,
                    'searchChatHistory',
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] text-white text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:bg-[#27272a] focus:border border-white/20 transition placeholder-white/40"
                />
              </>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="relative group mt-4"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/80" />
              </button>
            )}
          </div>
        </div>

        <div
          className={`mt-8 text-sm max-h-screen overflow-y-auto ${
            expand ? 'block' : 'hidden'
          }`}
        >
          {isClient && user ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between hover:bg-white/5 rounded-lg px-2 py-2 text-white/80">
                  <button
                    type="button"
                    onClick={() => router.push('/projects')}
                    className="flex items-center gap-2 text-base"
                  >
                    <span>Projects</span>
                  </button>
                  <div className="flex items-center gap-2 text-white/55">
                    <button
                      type="button"
                      onClick={() => router.push('/projects?create=true')}
                      aria-label="Add project"
                      className="rounded-md p-1 hover:bg-white/10 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => router.push('/projects')}
                      aria-label="Open projects"
                      className="rounded-md p-1 hover:bg-white/10 hover:text-white"
                    >
                      <SlidersHorizontal size={17} />
                    </button> */}
                    <button
                      className="rounded-md p-1 hover:bg-white/10 hover:text-white"
                      onClick={() => setProjectsOpen((value) => !value)}
                    >
                      {projectsOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </div>
                </div>
                {projectsOpen && (
                  <div className="space-y-1 px-1">
                    {projectRecords.length === 0 ? (
                      <p className="px-2 py-2 text-sm text-white/35">
                        No projects
                      </p>
                    ) : searchQuery.trim() ? (
                      <div>
                        {projectRecords
                          .filter((project) =>
                            project.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                          )
                          .map((project) => {
                            const projectId = String(
                              project.id ?? project._id ?? project.name,
                            );

                            return (
                              <ProjectLabel
                                key={projectId}
                                id={projectId}
                                name={project.name}
                                openMenu={openMenu}
                                setOpenMenu={setOpenMenu}
                              />
                            );
                          })}
                        {projectRecords.filter((project) =>
                          project.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        ).length === 0 && (
                          <p className="px-2 py-2 text-sm text-white/35">
                            No matching projects
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {renderProjectGroup(
                          groupedProjects.recent,
                          getTranslation(detectedLang, 'recent'),
                        )}
                        {renderProjectGroup(
                          groupedProjects.today,
                          getTranslation(detectedLang, 'today'),
                        )}
                        {renderProjectGroup(
                          groupedProjects.yesterday,
                          getTranslation(detectedLang, 'yesterday'),
                        )}
                        {renderProjectGroup(
                          groupedProjects.previousWeek,
                          getTranslation(detectedLang, 'previousWeek'),
                        )}
                        {renderProjectGroup(
                          groupedProjects.previousMonth,
                          getTranslation(detectedLang, 'previousMonth'),
                        )}
                        {renderProjectGroup(
                          groupedProjects.older,
                          getTranslation(detectedLang, 'older'),
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => router.push('/recents')}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-base text-white/80 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <span>Chats</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSessionsOpen((value) => !value)}
                    className="rounded-md p-1 hover:bg-white/10 hover:text-white"
                  >
                    {sessionsOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                </button>
                {sessionsOpen && (
                  <div className="mt-1">
                    {searchQuery.trim() ? (
                      <div>
                        {chats
                          .filter((chat) =>
                            chat.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                          )
                          .map((chat) => (
                            <ChatLabel
                              key={chat._id}
                              name={chat.name}
                              id={chat._id}
                              openMenu={openMenu}
                              setOpenMenu={setOpenMenu}
                            />
                          ))}
                      </div>
                    ) : (
                      <>
                        {renderChatGroup(
                          groupedChats.recent,
                          getTranslation(detectedLang, 'recent'),
                        )}
                        {renderChatGroup(
                          groupedChats.today,
                          getTranslation(detectedLang, 'today'),
                        )}
                        {renderChatGroup(
                          groupedChats.yesterday,
                          getTranslation(detectedLang, 'yesterday'),
                        )}
                        {renderChatGroup(
                          groupedChats.previousWeek,
                          getTranslation(detectedLang, 'previousWeek'),
                        )}
                        {renderChatGroup(
                          groupedChats.previousMonth,
                          getTranslation(detectedLang, 'previousMonth'),
                        )}
                        {renderChatGroup(
                          groupedChats.older,
                          getTranslation(detectedLang, 'older'),
                        )}
                        {chats.length === 0 && (
                          <p className="px-2 py-2 text-sm text-white/35">
                            No recent chats
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="py-2 mt-auto">
          <div
            className={`flex items-center ${
              expand
                ? 'hover:bg-gray-500/10 rounded-lg justify-between'
                : 'justify-center w-full pt-4'
            } gap-3 text-white/60 text-sm p-2`}
            onClick={!user ? () => router.push('/') : undefined}
          >
            <div className="flex items-center gap-3">
              {user ? (
                <Image
                  src={user.photoURL || assets.profile_icon}
                  alt="Profile"
                  width={28}
                  height={28}
                  onClick={toggleUserMenu}
                  className="w-7 rounded-full cursor-pointer"
                />
              ) : (
                <Image
                  src={assets.profile_icon as string}
                  alt="Profile"
                  width={28}
                  height={28}
                  className="w-7 cursor-pointer"
                  onClick={() => router.push('/')}
                />
              )}
              {expand && (
                <span className="text-sm font-head cursor-pointer">
                  {user ? `${user?.displayName || ''}` : 'Login'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSearchOpen(true);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Open search"
              >
                <Search size={16} />
              </button>

              {expand && (
                <Image
                  src={assets.three_dots as string}
                  alt="Menu"
                  width={20}
                  height={20}
                  onClick={toggleUserMenu}
                  className="w-5 cursor-pointer block group-hover:block"
                />
              )}
            </div>
          </div>

          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />

          {user && showUserMenu && (
            <div
              ref={userMenuRef}
              className="fixed z-[70] w-64 rounded-xl border border-gray-500/20 bg-[#121212] p-2 shadow-lg select-none"
              style={userMenuPosition}
            >
              <button
                onClick={() =>
                  window.open('https://omg-ai.vercel.app', '_blank')
                }
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer group relative"
              >
                <FaDownload size={16} />
                <span>{getTranslation(detectedLang, 'downloadApp')}</span>
                <Image
                  src={assets.new_icon as string}
                  alt="New"
                  width={16}
                  height={16}
                />
                <div
                  className={`absolute -top-60 pb-8 opacity-0 group-hover:opacity-100 hidden md:group-hover:block transition-all`}
                >
                  <div className="relative w-max bg-black border border-gray-500/20 text-white text-sm p-3 rounded-lg shadow-lg">
                    <Image
                      src={assets.qrcode}
                      alt="QR Code"
                      width={176}
                      height={176}
                      className="w-44"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      Scan to download the app
                    </p>
                    <div className="w-3 h-3 border-b border-r border-gray-500/20 absolute bg-black rotate-45 right-1/2 -translate-x-1/2 -bottom-1.5" />
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  window.open(
                    'https://instagram.com/abhishekprajapatt',
                    '_blank',
                  )
                }
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <FaInstagram size={16} />
                <span>{getTranslation(detectedLang, 'instagram')}</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    'https://linkedin.com/in/abhishekprajapatt',
                    '_blank',
                  )
                }
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <FaLinkedin size={16} />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() =>
                  window.open('https://discord.gg/abhishekprajapatt', '_blank')
                }
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <FaDiscord size={16} />
                <span>Discord</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    'https://reddit.com/u/abhishekprajapatt',
                    '_blank',
                  )
                }
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <FaReddit size={16} />
                <span>Reddit</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <IoSettingsSharp size={16} />
                <span>{getTranslation(detectedLang, 'settingsCard')}</span>
              </button>

              <button
                onClick={() => {
                  window.location.href =
                    'mailto:visionex.app@gmail.com?subject=Contact from Omega App';
                }}
                className="w-full flex font-head items-center gap-3 text-white/80 text-sm p-3 rounded-lg hover:bg-gray-500/20 transition cursor-pointer"
              >
                <GrSend size={16} />
                <span>{getTranslation(detectedLang, 'contactUs')}</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    await signOut();
                    router.push('/');
                  } catch (error) {
                    toast.error('Failed to logout');
                    console.error('Logout error:', error);
                  }
                }}
                className="w-full flex items-center gap-3 font-head text-white/80 text-sm p-3 rounded-lg hover:bg-red-500/20 transition cursor-pointer"
              >
                <MdLogout size={16} />
                <span>{getTranslation(detectedLang, 'logoutButton')}</span>
              </button>
              <div
                className={`bg-[#121212]  border-gray-500/20 absolute rotate-45 -translate-x-1/2 ${
                  expand
                    ? 'w-3 h-3 border-b border-r left-5 -bottom-1.5 '
                    : 'w-2.5 h-2.5 border-b border-l left-0 bottom-2'
                }`}
              />
            </div>
          )}

          {showSettings && (
            <SettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
