'use client';

import {
  ArrowLeft,
  BookOpenText,
  Blocks,
  Check,
  ChevronDown,
  ExternalLink,
  FilePlus2,
  Pencil,
  Plus,
  Search,
  Plug,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useFirebaseAuth } from '@/context/AuthContext';
import { useSkillsContext } from '@/context/SkillsContext';

type DirectoryKind = 'skills' | 'connectors' | 'plugins';
type DirectoryItem = {
  id: string;
  kind?: DirectoryKind;
  name: string;
  description: string;
  author: string;
  downloads: string;
  category: string;
  installed?: boolean;
  status?: 'installed' | 'connected' | 'enabled' | 'draft' | 'disabled';
  community?: boolean;
  remoteUrl?: string;
  source?: string;
  sourceUrl?: string;
  iconUrl?: string;
  websiteUrl?: string;
};

const initialSkills: DirectoryItem[] = [];

const filterCategories = [
  'Interactive',
  'Desktop',
  'Web',
  'Commerce & Shopping',
  'Communication',
  'Consumer Health',
  'Creative',
  'Data & Analytics',
  'Development tools',
  'Education',
  'Financial Services',
  'Health & Life Sciences',
  'Legal',
  'Media & Entertainment',
  'Nonprofit',
  'Other',
  'Productivity',
  'Sales and marketing',
  'Travel',
];

const popularConnectors: DirectoryItem[] = [
  {
    id: 'popular:gmail',
    name: 'Gmail',
    description: 'Find messages and draft replies.',
    author: 'Prajapatt',
    downloads: '-',
    category: 'Communication',
    websiteUrl: 'https://gmail.com',
    source: 'Prajapatt',
  },
  {
    id: 'popular:google-drive',
    name: 'Google Drive',
    description: 'Search and read files from Drive.',
    author: 'Prajapatt',
    downloads: '-',
    category: 'Productivity',
    websiteUrl: 'https://drive.google.com',
    source: 'Prajapatt',
  },
  {
    id: 'popular:slack',
    name: 'Slack',
    description: 'Search messages and send updates.',
    author: 'Prajapatt',
    downloads: '-',
    category: 'Communication',
    websiteUrl: 'https://slack.com',
    source: 'Prajapatt',
  },
];

function Menu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
      >
        {label}
        <ChevronDown size={15} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-30 max-h-80 min-w-[190px] overflow-y-auto rounded-xl border border-white/15 bg-[#222] p-1.5 shadow-2xl">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MenuOption({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10"
    >
      <span>{children}</span>
      {selected && <Check size={17} className="text-blue-400" />}
    </button>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-white/15 bg-[#202020] p-6 shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function SkillsPanel() {
  const { getIdToken, isAuthenticated } = useFirebaseAuth();
  const {
    skills: contextSkills,
    createSkill,
    deleteSkill,
  } = useSkillsContext();
  const [skills, setSkills] = useState<DirectoryItem[]>(() => {
    return initialSkills;
  });

  useEffect(() => {
    const mappedSkills = contextSkills.map((skill) => ({
      id: skill._id ?? skill.id ?? skill.name,
      kind: 'skills' as const,
      name: skill.name,
      description: skill.description,
      author: skill.author ?? 'You',
      downloads: '-',
      category: skill.category,
      installed: true,
      status: skill.status ?? 'enabled',
      source: 'workspace',
      sourceUrl: skill.prompt,
      websiteUrl: undefined,
    }));
    setSkills(mappedSkills);
  }, [contextSkills]);
  const [query, setQuery] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [modal, setModal] = useState<'upload' | 'create' | null>(null);
  const [directoryTab, setDirectoryTab] = useState<DirectoryKind>('skills');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<'All' | 'Installed' | 'Not installed'>(
    'All',
  );
  const [sort, setSort] = useState('Default');
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [savedDirectoryItems, setSavedDirectoryItems] = useState<
    DirectoryItem[]
  >([]);
  const [catalogItems, setCatalogItems] = useState<DirectoryItem[]>([]);
  const [catalogCursor, setCatalogCursor] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getIdToken()
      .then((token) =>
        Promise.all(
          (['skills', 'connectors', 'plugins'] as DirectoryKind[]).map(
            async (kind) => {
              const response = await fetch(`/api/customize/${kind}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!response.ok) throw new Error(`Unable to load ${kind}`);
              return response.json() as Promise<{
                items: Array<
                  DirectoryItem & { kind: DirectoryKind; status: string }
                >;
              }>;
            },
          ),
        ),
      )
      .then((responses) => {
        const items = responses.flatMap((response) => response.items);
        if (!cancelled) {
          const normalizedItems = items.map((item) => ({
            ...item,
            downloads: item.downloads || '-',
            installed: item.status === 'installed',
          }));
          setSavedDirectoryItems(normalizedItems);
          setConnected(
            normalizedItems
              .filter((item) => item.status === 'connected')
              .map((item) => item.name),
          );
          setSkills(normalizedItems.filter((item) => item.kind === 'skills'));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load your skills');
      });
    return () => {
      cancelled = true;
    };
  }, [getIdToken, isAuthenticated]);

  useEffect(() => {
    if (!browseOpen) return;
    const controller = new AbortController();
    const endpoint = directoryTab === 'skills' ? 'skills' : directoryTab;
    setCatalogLoading(true);
    setCatalogCursor(null);
    fetch(
      `/api/customize/${endpoint}?catalog=live&search=${encodeURIComponent(directoryQuery)}`,
      {
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (!response.ok) throw new Error('Directory catalog unavailable');
        return response.json() as Promise<{
          items: DirectoryItem[];
          nextCursor?: string | null;
        }>;
      })
      .then(({ items, nextCursor }) => {
        setCatalogItems(items);
        setCatalogCursor(nextCursor || null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        toast.error('Could not load the live MCP catalog');
      })
      .finally(() => setCatalogLoading(false));
    return () => controller.abort();
  }, [browseOpen, directoryQuery, directoryTab]);

  const loadMoreCatalog = async () => {
    if (!browseOpen || !catalogCursor || catalogLoading) return;
    const endpoint = directoryTab === 'skills' ? 'skills' : directoryTab;
    setCatalogLoading(true);
    try {
      const response = await fetch(
        `/api/customize/${endpoint}?catalog=live&search=${encodeURIComponent(directoryQuery)}&cursor=${encodeURIComponent(catalogCursor)}`,
      );
      if (!response.ok) throw new Error('Directory catalog unavailable');
      const page = (await response.json()) as {
        items: DirectoryItem[];
        nextCursor?: string | null;
      };
      setCatalogItems((current) => {
        const merged = new Map(current.map((item) => [item.id, item]));
        page.items.forEach((item) => merged.set(item.id, item));
        return Array.from(merged.values());
      });
      setCatalogCursor(page.nextCursor || null);
    } catch {
      toast.error('Could not load more connectors');
    } finally {
      setCatalogLoading(false);
    }
  };

  const saveItem = async (
    item: Omit<DirectoryItem, 'id'> & { kind: DirectoryKind },
  ) => {
    const token = await getIdToken();
    const endpoint = item.kind;
    const response = await fetch(`/api/customize/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Unable to save directory item');
    const saved = (
      (await response.json()) as { item: DirectoryItem & { status?: string } }
    ).item;
    return {
      ...saved,
      downloads: saved.downloads || '-',
      installed: saved.status === 'installed',
    };
  };

  const visibleSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(query.toLowerCase()),
  );
  const activeDirectoryItems =
    directoryTab === 'skills'
      ? catalogItems
          .map((item) => ({
            ...item,
            installed: skills.some((skill) => skill.name === item.name),
          }))
          .concat(
            skills.map((skill) => ({
              ...skill,
              installed: Boolean(skill.installed),
            })),
          )
      : catalogItems
          .filter(
            (item) =>
              !savedDirectoryItems.some(
                (saved) =>
                  saved.kind === directoryTab && saved.name === item.name,
              ),
          )
          .concat(
            savedDirectoryItems.filter((item) => item.kind === directoryTab),
          );
  const directoryItemsWithPopular =
    directoryTab === 'connectors'
      ? [...popularConnectors, ...activeDirectoryItems]
      : activeDirectoryItems;
  const visibleDirectory = useMemo(
    () =>
      directoryItemsWithPopular.filter(
        (item) =>
          item.name.toLowerCase().includes(directoryQuery.toLowerCase()) &&
          (directoryTab !== 'connectors' ||
            Boolean(directoryQuery) ||
            !popularConnectors.some((popular) => popular.name === item.name)) &&
          (category === 'All' || item.category === category) &&
          (status === 'All' ||
            (status === 'Installed'
              ? item.installed || connected.includes(item.name)
              : !item.installed && !connected.includes(item.name))),
      ),
    [category, connected, directoryItemsWithPopular, directoryQuery, status],
  );
  const sortedDirectory = [...visibleDirectory].sort((a, b) =>
    sort === 'Alphabetical'
      ? a.name.localeCompare(b.name)
      : sort === 'Popular'
        ? b.downloads.localeCompare(a.downloads)
        : 0,
  );

  const install = (item: DirectoryItem) => {
    if (directoryTab === 'skills') {
      if (skills.some((skill) => skill.name === item.name)) {
        toast.success(`${item.name} is already installed`);
        return;
      }
      saveItem({
        name: item.name,
        description: item.description,
        author: item.author,
        downloads: item.downloads,
        category: item.category,
        iconUrl: item.iconUrl,
        websiteUrl: item.websiteUrl,
        source: item.source,
        sourceUrl: item.sourceUrl,
        installed: true,
        kind: 'skills',
      })
        .then((saved) => {
          setSkills((current) => [...current, saved]);
          toast.success(`${item.name} installed`);
        })
        .catch(() => toast.error('Could not install this skill'));
    } else if (!item.remoteUrl) {
      toast.error('This MCP server has no remote endpoint');
    } else {
      saveItem({ ...item, kind: directoryTab, installed: false })
        .then((saved) => {
          setSavedDirectoryItems((current) => [...current, saved]);
          setConnected((current) => [...new Set([...current, item.name])]);
          setCatalogItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, installed: true } : entry,
            ),
          );
          toast.success(`${saved.name} added to your directory`);
        })
        .catch(() => toast.error('Could not save this MCP server'));
    }
  };

  const handleCreateSkill = async () => {
    const name = skillName.trim();
    if (!name || !description.trim() || !content.trim()) {
      return toast.error('Complete all skill fields first');
    }

    try {
      await createSkill({
        name,
        description,
        category: 'Productivity',
        version: '1.0.0',
        status: 'enabled',
        prompt: content,
        author: 'You',
      });
      setSkillName('');
      setDescription('');
      setContent('');
      setModal(null);
      toast.success('Skill created');
    } catch {
      toast.error('Could not save skill');
    }
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!/\.(md|zip|skill)$/i.test(file.name)) {
      return toast.error('Upload an .md, .zip, or .skill file');
    }
    const name = file.name.replace(/\.(md|zip|skill)$/i, '');

    try {
      await createSkill({
        name,
        description: 'Uploaded skill awaiting security scan.',
        category: 'Other',
        version: '1.0.0',
        status: 'enabled',
        prompt: `Uploaded file: ${file.name}`,
        author: 'You',
      });
      setModal(null);
      toast.success('Skill uploaded and queued for security scan');
    } catch {
      toast.error('Could not save uploaded skill');
    }
  };

  return (
    <section className="min-h-[560px] text-white">
      <header className="mb-7 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Skills</h2>
        <div className="flex items-center gap-2">
          <label className="relative hidden sm:block">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills"
              className="w-44 rounded-lg border border-white/10 bg-white/[.05] py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <button
            type="button"
            onClick={() => setBrowseOpen(true)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Browse
          </button>
          <Menu label="Add">
            <MenuOption onClick={() => setModal('upload')}>
              <Upload size={16} className="mr-2 inline" />
              Upload skill
            </MenuOption>
            <MenuOption onClick={() => setModal('create')}>
              <Pencil size={16} className="mr-2 inline" />
              Create a skill
            </MenuOption>
            <MenuOption onClick={() => setModal('create')}>
              <Sparkles size={16} className="mr-2 inline" />
              Create with Prajapatt
            </MenuOption>
          </Menu>
        </div>
      </header>
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 sm:hidden">
        <Search size={16} className="text-white/40" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search skills"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_130px_110px_32px] border-b border-white/10 px-3 py-3 text-sm text-white/60">
        <span>Skill</span>
        <span>Last updated</span>
        <span>Author</span>
        <span />
      </div>
      {visibleSkills.map((skill) => (
        <div
          key={skill.id}
          className="grid grid-cols-[minmax(0,1fr)_130px_110px_32px] items-center border-b border-white/[.07] px-3 py-4 text-sm"
        >
          <span>{skill.name}</span>
          <span className="text-white/60">9/10/26</span>
          <span className="text-white/60">{skill.author}</span>
          <button
            type="button"
            aria-label={`Remove ${skill.name}`}
            onClick={async () => {
              try {
                const token = await getIdToken();
                const response = await fetch(
                  `/api/skills?id=${encodeURIComponent(skill.id)}`,
                  {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );
                if (!response.ok) throw new Error('Delete failed');
                setSkills((current) =>
                  current.filter((item) => item.id !== skill.id),
                );
                toast.success(`${skill.name} removed`);
              } catch {
                toast.error('Could not remove skill');
              }
            }}
            className="text-white/35 hover:text-red-300"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      {!visibleSkills.length && (
        <p className="py-12 text-center text-sm text-white/45">
          No skills match your search.
        </p>
      )}

      {browseOpen && (
        <Modal
          title="Directory"
          onClose={() => {
            setBrowseOpen(false);
            setSelectedItem(null);
          }}
          wide
        >
          <div className="flex min-h-[620px] gap-7">
            <nav className="w-40 shrink-0 space-y-1 border-r border-white/[.07] pr-4">
              <h3 className="mb-5 font-serif text-2xl">Directory</h3>
              {(['skills', 'connectors', 'plugins'] as DirectoryKind[]).map(
                (kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      setDirectoryTab(kind);
                      setSelectedItem(null);
                      setCategory('All');
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm capitalize ${directoryTab === kind ? 'bg-white/20 font-medium' : 'text-white/70 hover:bg-white/10'}`}
                  >
                    {kind === 'skills' && (
                      <BookOpenText size={17} strokeWidth={1.8} />
                    )}
                    {kind === 'connectors' && (
                      <Blocks size={17} strokeWidth={1.8} />
                    )}
                    {kind === 'plugins' && <Plug size={17} strokeWidth={1.8} />}
                    {kind}
                  </button>
                ),
              )}
            </nav>
            <div className="min-w-0 flex-1">
              {selectedItem ? (
                <DetailView
                  item={selectedItem}
                  kind={directoryTab}
                  installed={
                    selectedItem.installed ||
                    connected.includes(selectedItem.name)
                  }
                  onBack={() => setSelectedItem(null)}
                  onAction={() => install(selectedItem)}
                />
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/15 bg-white/[.05] px-3 py-2 focus-within:border-blue-500">
                    <Search size={17} className="text-white/50" />
                    <input
                      autoFocus
                      value={directoryQuery}
                      onChange={(event) =>
                        setDirectoryQuery(event.target.value)
                      }
                      placeholder={`Search ${directoryTab}...`}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-white/10 px-3 py-2 text-sm">
                      Prajapatt
                    </span>
                    <div className="flex gap-2">
                      <Menu label="Filter by">
                        <MenuOption
                          selected={status === 'All'}
                          onClick={() => setStatus('All')}
                        >
                          All
                        </MenuOption>
                        <MenuOption
                          selected={status === 'Installed'}
                          onClick={() => setStatus('Installed')}
                        >
                          Installed
                        </MenuOption>
                        <MenuOption
                          selected={status === 'Not installed'}
                          onClick={() => setStatus('Not installed')}
                        >
                          Not installed
                        </MenuOption>
                        {filterCategories.map((item) => (
                          <MenuOption
                            key={item}
                            selected={category === item}
                            onClick={() => setCategory(item)}
                          >
                            {item}
                          </MenuOption>
                        ))}
                      </Menu>
                      <Menu label="Sort by">
                        <MenuOption
                          selected={sort === 'Default'}
                          onClick={() => setSort('Default')}
                        >
                          Default
                        </MenuOption>
                        <MenuOption
                          selected={sort === 'Popular'}
                          onClick={() => setSort('Popular')}
                        >
                          Popular
                        </MenuOption>
                        <MenuOption
                          selected={sort === 'Alphabetical'}
                          onClick={() => setSort('Alphabetical')}
                        >
                          Alphabetical
                        </MenuOption>
                      </Menu>
                    </div>
                  </div>
                  <div
                    className="grid max-h-[510px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2"
                    onScroll={(event) => {
                      const element = event.currentTarget;
                      if (
                        element.scrollHeight -
                          element.scrollTop -
                          element.clientHeight <
                        180
                      ) {
                        void loadMoreCatalog();
                      }
                    }}
                  >
                    {directoryTab === 'connectors' && !directoryQuery && (
                      <div className="col-span-full">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/45">
                          Popular
                        </p>
                        <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                          {popularConnectors.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3 text-left hover:border-white/25 hover:bg-white/[.08]"
                            >
                              <DirectoryLogo item={item} />
                              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                {item.name}
                              </span>
                              <Plus size={18} className="text-white/70" />
                            </button>
                          ))}
                        </div>
                        <p className="mb-3 mt-5 text-xs uppercase tracking-[0.14em] text-white/45">
                          All connectors
                        </p>
                      </div>
                    )}
                    {sortedDirectory.map((item) => (
                      <DirectoryCard
                        key={item.id}
                        item={item}
                        kind={directoryTab}
                        installed={
                          item.installed || connected.includes(item.name)
                        }
                        onOpen={() => setSelectedItem(item)}
                        onAction={() => install(item)}
                      />
                    ))}
                    {catalogLoading && (
                      <p className="col-span-full py-4 text-center text-xs text-white/45">
                        Loading more...
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
      {modal === 'upload' && (
        <Modal title="Upload skill" onClose={() => setModal(null)}>
          <h2 className="pr-8 text-3xl font-semibold">Upload skill</h2>
          <p className="mt-2 max-w-2xl text-lg text-white/65">
            After upload, your skill goes through a brief{' '}
            <a href="#security" className="text-blue-400 underline">
              security scan
            </a>{' '}
            before it is ready to use.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-8 flex h-44 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/25 bg-white/[.02] text-white/55 hover:border-blue-400 hover:text-white/80"
          >
            <FilePlus2 size={34} />
            <span>Drag and drop or click to upload</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.zip,.skill"
            className="hidden"
            onChange={(event) => handleUpload(event.target.files?.[0])}
          />
          <div className="mt-5 text-sm text-white/55">
            <p>File requirements</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                .md file must contain skill name and description formatted in
                YAML
              </li>
              <li>.zip or .skill file must include a SKILL.md file</li>
            </ul>
          </div>
        </Modal>
      )}
      {modal === 'create' && (
        <Modal title="Create a skill" onClose={() => setModal(null)} wide>
          <h2 className="pr-8 text-3xl font-semibold">Create a skill</h2>
          <label className="mt-5 block text-sm font-medium">
            Skill name
            <input
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              placeholder="weekly-status-report"
              className="mt-2 w-full rounded-lg border border-white/15 bg-white/[.06] px-3 py-3 outline-none focus:border-blue-500"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Generate weekly status reports from recent work."
              className="mt-2 h-24 w-full resize-none rounded-lg border border-white/15 bg-white/[.06] px-3 py-3 outline-none focus:border-blue-500"
            />
          </label>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-white/70">
              <span>SKILL.md</span>
              <button
                type="button"
                onClick={() => setContent((value) => `${value}\n`)}
                className="flex items-center gap-2 hover:text-white"
              >
                <Plus size={15} />
                Add line
              </button>
            </div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Summarize my recent work in three sections: wins, blockers, and next steps."
              className="h-56 w-full resize-none bg-transparent p-5 font-mono text-sm text-white/80 outline-none"
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSkill}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Create
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function DirectoryCard({
  item,
  kind,
  installed,
  onOpen,
  onAction,
}: {
  item: DirectoryItem;
  kind: DirectoryKind;
  installed?: boolean;
  onOpen: () => void;
  onAction: () => void;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[.015] p-4 transition hover:border-white/25">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <DirectoryLogo item={item} />
            <div className="min-w-0">
              <h3 className="truncate font-semibold">
                {kind === 'skills' ? '/' : ''}
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-white/45">
                {item.author} <span className="mx-1">•</span> ↓{item.downloads}
              </p>
            </div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-xl text-white/80">
            {installed ? <Check size={17} className="text-blue-400" /> : '+'}
          </span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-5 text-white/50">
          {item.description}
        </p>
      </button>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/60">
          {item.category}
        </span>
        <button
          type="button"
          onClick={onAction}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {installed
            ? kind === 'skills'
              ? 'Installed'
              : 'Connected'
            : kind === 'skills'
              ? 'Install'
              : 'Connect'}
        </button>
      </div>
    </article>
  );
}

function DirectoryLogo({ item }: { item: DirectoryItem }) {
  const [logoSource, setLogoSource] = useState(() => getLogoSource(item));

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[.04]">
      <img
        src={logoSource}
        alt={`${item.name} logo`}
        loading="lazy"
        className="h-full w-full object-contain p-1"
        onError={() => {
          const fallbackSource = getFallbackLogoSource(item, logoSource);
          if (fallbackSource) setLogoSource(fallbackSource);
        }}
      />
    </div>
  );
}

function getLogoSource(item: DirectoryItem): string {
  if (item.iconUrl) return item.iconUrl;

  const domain = getWebsiteDomain(item.websiteUrl);
  return domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
    : `https://icons.duckduckgo.com/ip3/${encodeURIComponent(item.name)}.ico`;
}

function getFallbackLogoSource(
  item: DirectoryItem,
  currentSource: string,
): string | null {
  const domain = getWebsiteDomain(item.websiteUrl);
  const faviconSource = domain
    ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`
    : null;

  return faviconSource && currentSource !== faviconSource
    ? faviconSource
    : null;
}

function getWebsiteDomain(websiteUrl?: string): string | null {
  if (!websiteUrl) return null;

  try {
    return new URL(websiteUrl).hostname;
  } catch {
    return null;
  }
}

function DetailView({
  item,
  kind,
  installed,
  onBack,
  onAction,
}: {
  item: DirectoryItem;
  kind: DirectoryKind;
  installed?: boolean;
  onBack: () => void;
  onAction: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {kind === 'skills' ? '/' : ''}
            {item.name}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            by {item.author} <span className="mx-2">•</span>
            {item.category}
          </p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          {installed ? 'Installed' : kind === 'skills' ? 'Install' : 'Connect'}
        </button>
      </div>
      <p className="mt-8 leading-6 text-white/75">{item.description}</p>
      <p className="mt-7 leading-6 text-white/65">
        This {kind.slice(0, -1)} gives Prajapatt focused capabilities for{' '}
        {item.category.toLowerCase()} workflows. Ask Prajapatt to use it
        whenever this context is relevant.
      </p>
      <div className="mt-8 border-t border-white/10 pt-5">
        <p className="text-sm font-medium">Details</p>
        <p className="mt-3 text-sm text-white/55">Author: {item.author}</p>
        <a
          href="#directory"
          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400"
        >
          Learn more <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
