'use client';

import Image from 'next/image';
import { useState, type MouseEvent } from 'react';
import {
  Bell,
  ChevronDown,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react';
import { assets } from '@/public/assets/assets';
import PromptBox from '@/components/shared/PromptBox';
import Sidebar from '@/components/layout/Sidebar';

interface WorkspaceProps {
  projectName: string;
  initialPrompt?: string;
}

type FileNode = {
  name: string;
  type: 'file' | 'folder';
  isOpen?: boolean;
  children?: FileNode[];
};

type EditorFile = {
  name: string;
  content: string;
};

const editorFiles: Record<string, EditorFile> = {
  'app/page.tsx': {
    name: 'app/page.tsx',
    content: `export default function Page() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Project Workspace</h1>
    </main>
  );
}`,
  },
  'components/projects/Workspace.tsx': {
    name: 'Workspace.tsx',
    content: `import Image from 'next/image';
import { useState } from 'react';
import { FileCode2, Settings2, X } from 'lucide-react';

export default function Workspace() {
  const [activeFile, setActiveFile] = useState('Workspace.tsx');

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#0d1117] px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <FileCode2 size={14} className="text-[#6ba8ff]" />
          <span>Workspace.tsx</span>
        </div>
        <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
          Run
        </button>
      </header>
    </div>
  );
}`,
  },
  'components/PromptBox.tsx': {
    name: 'components/PromptBox.tsx',
    content: `export default function PromptBox() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4 text-white">
      <textarea className="w-full bg-transparent outline-none" placeholder="Describe your app..." />
    </div>
  );
}`,
  },
  'context/AppContext.tsx': {
    name: 'context/AppContext.tsx',
    content: `export function AppContext() {
  return {
    project: 'workspace',
    status: 'ready',
  };
}`,
  },
  'package.json': {
    name: 'package.json',
    content: `{
  "name": "project-workspace",
  "private": true,
  "scripts": {
    "dev": "next dev"
  }
}`,
  },
  'tsconfig.json': {
    name: 'tsconfig.json',
    content: `{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "strict": true
  }
}`,
  },
};

function PrajapattLogo({
  className = '',
  size = 220,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={className}>
      <Image
        src={assets.pai_logo}
        alt="Prajapatt logo"
        width={size}
        height={size}
        className="object-contain opacity-70"
      />
    </div>
  );
}

const fileTree: FileNode[] = [
  {
    name: 'app',
    type: 'folder',
    isOpen: true,
    children: [
      { name: 'page.tsx', type: 'file' },
      { name: 'layout.tsx', type: 'file' },
      {
        name: 'api',
        type: 'folder',
        isOpen: true,
        children: [{ name: 'chat/create/route.ts', type: 'file' }],
      },
    ],
  },
  {
    name: 'components',
    type: 'folder',
    isOpen: true,
    children: [
      { name: 'PromptBox.tsx', type: 'file' },
      { name: 'Sidebar.tsx', type: 'file' },
      { name: 'WorkspaceShell.tsx', type: 'file' },
    ],
  },
  {
    name: 'context',
    type: 'folder',
    isOpen: true,
    children: [{ name: 'AppContext.tsx', type: 'file' }],
  },
  {
    name: 'lib',
    type: 'folder',
    isOpen: true,
    children: [{ name: 'utils.ts', type: 'file' }],
  },
  {
    name: 'db',
    type: 'folder',
    isOpen: true,
    children: [{ name: 'db.ts', type: 'file' }],
  },
  { name: 'package.json', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
];

function renderTree(
  nodes: FileNode[],
  onOpenFile: (fileName: string) => void,
  level = 0,
  parentPath = '',
) {
  return nodes.map((node) => {
    const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;

    return (
      <div key={nodePath}>
        <div
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-[12px] text-white/70 hover:bg-white/5"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              onOpenFile(nodePath);
            }
          }}
        >
          {node.type === 'folder' ? (
            <FolderOpen size={13} className="text-[#9ec1ff]" />
          ) : (
            <FileText size={12} className="text-white/50" />
          )}
          <span>{node.name}</span>
        </div>
        {node.children &&
          node.isOpen &&
          renderTree(node.children, onOpenFile, level + 1, nodePath)}
      </div>
    );
  });
}

export default function Workspace({
  projectName = 'Project',
  initialPrompt = '',
}: WorkspaceProps) {
  const [openedFiles, setOpenedFiles] = useState<string[]>([
    'components/projects/Workspace.tsx',
  ]);
  const [activeFile, setActiveFile] = useState<string>(
    'components/projects/Workspace.tsx',
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openFile = (fileName: string) => {
    const fallbackKey =
      Object.keys(editorFiles).find((key) => key.endsWith(fileName)) ??
      Object.keys(editorFiles).find((key) =>
        key.endsWith(fileName.split('/').pop() ?? fileName),
      ) ??
      'app/page.tsx';

    const normalized = fallbackKey;

    setOpenedFiles((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized],
    );
    setActiveFile(normalized);
  };

  const closeFile = (
    fileName: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    setOpenedFiles((prev) => {
      const next = prev.filter((item) => item !== fileName);

      if (fileName === activeFile) {
        setActiveFile(next[next.length - 1] || '');
      }

      return next;
    });
  };

  const currentFile =
    editorFiles[activeFile] ||
    editorFiles[activeFile.split('/').pop() ?? activeFile] ||
    editorFiles['app/page.tsx'];

  const statusIcons = [
    { label: 'Explorer', icon: Folder },
    { label: 'Search', icon: Search },
    { label: 'Terminal', icon: TerminalSquare },
    { label: 'Extensions', icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar expand={sidebarOpen} setExpand={setSidebarOpen} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-between border-b border-white/10 px-2 text-[12px] text-white/70">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-[#7aa7ff]">
              <FileCode2 size={16} />
            </div>
            <div className="font-medium text-white/80">File</div>
            <div className="font-medium text-white/80">Edit</div>
            <div className="font-medium text-white/80">Selection</div>
            <div className="font-medium text-white/80">View</div>
            <div className="font-medium text-white/80">Go</div>
          </div>

          <div className="flex items-center gap-3 text-white/60">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
              <span className="text-[10px] uppercase tracking-[0.18em]">
                client
              </span>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/5">
              <PanelLeftClose size={14} />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/5">
              <PanelLeftOpen size={14} />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/5">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="flex w-16 flex-col items-center justify-between border-r border-white/10 py-3">
            <div className="flex flex-col items-center gap-3">
              {statusIcons.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  title={label}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                    label === 'Explorer'
                      ? 'border-[#4b90ff]/40 bg-[#1d2f52] text-[#9ec1ff]'
                      : 'border-transparent bg-transparent text-white/45 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                <Settings2 size={14} />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                <Bell size={14} />
              </button>
            </div>
          </aside>

          <aside className="w-[250px] border-r border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
                Explorer
              </div>
              <button className="rounded-md p-1 text-white/50 hover:bg-white/5">
                <ChevronDown size={12} />
              </button>
            </div>

            <div className="border-b border-white/10 bg-[#151b25] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
              {projectName}
            </div>

            <div className="p-2">{renderTree(fileTree, openFile)}</div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-2">
              <div className="flex items-center gap-2 overflow-hidden">
                {openedFiles.map((fileName) => (
                  <div
                    key={fileName}
                    className={`group flex max-w-[180px] items-center gap-2 rounded-t-md border border-b-0 px-2 py-2 text-[11px] ${
                      activeFile === fileName
                        ? 'border-[#3d6ad6]/40 text-white'
                        : 'border-transparent bg-transparent text-white/50 hover:bg-white/5'
                    }`}
                    onClick={() => setActiveFile(fileName)}
                  >
                    <FileCode2 size={12} className="shrink-0 text-[#8ab4ff]" />
                    <span className="truncate">
                      {editorFiles[fileName]?.name ?? fileName.split('/').pop()}
                    </span>
                    <button
                      aria-label={`Close ${fileName}`}
                      className="hidden h-4 w-4 items-center justify-center rounded-sm hover:bg-white/10 group-hover:flex"
                      onClick={(event) => closeFile(fileName, event)}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <button className="rounded-md p-1 hover:bg-white/5">
                  <Plus size={13} />
                </button>
                <button className="rounded-md p-1 hover:bg-white/5">
                  <Settings2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
                  <span>{currentFile.name}</span>
                  <span className="rounded-full border border-[#3a6fd6]/40 px-2 py-0.5 text-[9px] text-[#a8c5ff]">
                    active
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 overflow-auto">
                  <div className="min-w-[56px] border-r border-white/10 px-3 py-4 text-right font-mono text-[12px] leading-6 text-white/35">
                    {Array.from(
                      { length: currentFile.content.split('\n').length },
                      (_, index) => (
                        <div key={index}>{index + 1}</div>
                      ),
                    )}
                  </div>
                  <pre className="flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-[12px] leading-6 text-white/80">
                    {currentFile.content}
                  </pre>
                </div>
              </div>

              <aside className="flex w-[340px] flex-col border-l border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 p-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                    Chat
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <button className="rounded-md p-1 hover:bg-white/5">
                      <Plus size={13} />
                    </button>
                    <button className="rounded-md p-1 hover:bg-white/5">
                      <X size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <div className="mb-3 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-sm text-white/60">
                    <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/45">
                      <span>AI</span>
                    </div>
                    <p className="text-white/80">
                      jo jo mai file choose kr rha wo wahi chahie open ho.
                    </p>
                  </div>

                  <div className="mt-auto rounded-xl">
                    <PromptBox initialPrompt={initialPrompt} />
                  </div>
                </div>
              </aside>
            </div>

            <div className="flex h-8 items-center justify-between border-t border-white/10 px-3 text-[10px] uppercase tracking-[0.12em] text-white/55">
              <div className="flex items-center gap-3">
                <span>Launchpad</span>
                <span>TypeScript</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Next.js</span>
                <span>Project: {projectName}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
