'use client';

import {
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  MessageSquare,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface DataActionProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: React.ReactNode;
}

type DataView =
  | 'overview'
  | 'export'
  | 'shared-chats'
  | 'shared-artifacts'
  | 'files'
  | 'feedback';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

function DataAction({ label, description, icon, action }: DataActionProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/10 py-5">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="text-white/55">{icon}</span>}
        <div>
          <p className="font-medium">{label}</p>
          {description && (
            <p className="mt-1 text-sm text-white/45">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function DetailHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to Privacy"
        className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft size={19} />
      </button>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function ExportView({
  onBack,
  exportData,
}: {
  onBack: () => void;
  exportData: (range: string) => Promise<void>;
}) {
  const [range, setRange] = useState('All');
  return (
    <section>
      <DetailHeader title="Privacy" onBack={onBack} />
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold">Export data</h3>
          <p className="mt-3 text-sm text-white/55">
            Download a copy of the conversations and account data stored by
            Prajapatt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void exportData(range)}
          className="rounded-lg bg-white px-4 py-2 text-sm text-black"
        >
          Export
        </button>
      </div>
      <div className="mt-10 flex items-center justify-between gap-6">
        <span className="text-sm font-medium">Conversations from</span>
        <div className="flex rounded-lg bg-white/[.07] p-1">
          {['All', '30 days', '90 days', 'Custom'].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setRange(item)}
              className={`rounded-md px-3 py-2 text-sm ${range === item ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-semibold">Export will include</h3>
        <ul className="mt-5 space-y-4 text-sm text-white/70">
          <li>✓ Conversations</li>
          <li>✓ Users</li>
          <li>✓ Projects</li>
        </ul>
      </div>
    </section>
  );
}

function SharedChatsView({ onBack }: { onBack: () => void }) {
  return (
    <section>
      <DetailHeader title="Privacy" onBack={onBack} />
      <h3 className="text-lg font-semibold">Shared chats</h3>
      <div className="mt-6 grid grid-cols-[1fr_150px_150px_90px] border-b border-white/10 pb-3 text-sm text-white/50">
        <span>Name</span>
        <span>Date shared</span>
        <span>Location</span>
        <span>Unshare</span>
      </div>
      <div className="py-14 text-center text-sm text-white/45">
        No shared chats found
      </div>
    </section>
  );
}

function SharedArtifactsView({ onBack }: { onBack: () => void }) {
  return (
    <section>
      <DetailHeader title="Privacy" onBack={onBack} />
      <h3 className="text-lg font-semibold">Shared artifacts</h3>
      <p className="mt-3 text-sm text-white/55">
        Unpublishing removes a public link. Once an artifact is unpublished, it
        cannot be republished.
      </p>
      <div className="py-20 text-center text-sm text-white/45">
        No shared content found
      </div>
    </section>
  );
}

function FeedbackView({ onBack }: { onBack: () => void }) {
  return (
    <section>
      <DetailHeader title="Your feedback" onBack={onBack} />
      <p className="text-sm text-white/55">
        Feedback records are not stored by this app yet.
      </p>
      <div className="mt-8 rounded-xl border border-white/10 p-5">
        <p className="text-sm text-white/65">
          Send feedback directly to the Prajapatt team.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href =
              'mailto:visionex.app@gmail.com?subject=Prajapatt%20feedback';
          }}
          className="mt-5 rounded-lg bg-white/10 px-4 py-2 text-sm"
        >
          Send feedback
        </button>
      </div>
    </section>
  );
}

function UploadedFilesView({
  files,
  onBack,
  onDelete,
  onFiles,
}: {
  files: UploadedFile[];
  onBack: () => void;
  onDelete: (name: string, uploadedAt: string) => void;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <section>
      <DetailHeader title="Privacy" onBack={onBack} />
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold">Uploaded files</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
            Deleting a file removes its local record. Text already extracted
            into a chat is not removed. To fully remove it, delete the chat.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
          <Upload size={15} />
          Add files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => onFiles(event.target.files)}
          />
        </label>
      </div>
      {files.length === 0 ? (
        <div className="py-20 text-center text-sm text-white/45">
          No uploaded files found
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-[1fr_150px_130px_70px] border-b border-white/10 pb-3 text-sm text-white/50">
            <span>Name</span>
            <span>Uploaded</span>
            <span>Size</span>
            <span>Delete</span>
          </div>
          {files.map((file) => (
            <div
              key={`${file.name}-${file.uploadedAt}`}
              className="grid grid-cols-[1fr_150px_130px_70px] items-center border-b border-white/[.07] py-4 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-white/55">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
              <span className="text-white/55">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => onDelete(file.name, file.uploadedAt)}
                aria-label={`Delete ${file.name}`}
                className="text-white/55 hover:text-red-300"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PrivacyPanel() {
  const [location, setLocation] = useState(true);
  const [improve, setImprove] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dataView, setDataView] = useState<DataView>('overview');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  useEffect(() => {
    const saved = window.localStorage.getItem('prajapatt-uploaded-files');
    if (saved) setUploadedFiles(JSON.parse(saved) as UploadedFile[]);
  }, []);
  const Toggle = ({
    value,
    setValue,
  }: {
    value: boolean;
    setValue: (value: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => setValue(!value)}
      className={`relative h-6 w-11 shrink-0 rounded-full ${value ? 'bg-blue-500' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`}
      />
    </button>
  );
  const exportData = async (range = 'All') => {
    try {
      const response = await fetch('/api/user/export-data');
      if (!response.ok) throw new Error();
      const { data } = await response.json();
      if (range !== 'All' && Array.isArray(data.chats)) {
        const days = range === '30 days' ? 30 : range === '90 days' ? 90 : null;
        if (days) {
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          data.chats = data.chats.filter(
            (chat: { updatedAt?: string }) =>
              new Date(chat.updatedAt || 0).getTime() >= cutoff,
          );
        }
        data.totalChats = data.chats.length;
        data.totalMessages = data.chats.reduce(
          (total: number, chat: { messages?: unknown[] }) =>
            total + (chat.messages?.length || 0),
          0,
        );
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      link.download = `prajapatt-data-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Data exported');
    } catch {
      toast.error('Failed to export data');
    }
  };
  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));
    const existing = JSON.parse(
      window.localStorage.getItem('prajapatt-uploaded-files') || '[]',
    ) as typeof uploaded;
    const nextFiles = [...uploaded, ...existing];
    window.localStorage.setItem(
      'prajapatt-uploaded-files',
      JSON.stringify(nextFiles),
    );
    setUploadedFiles(nextFiles);
    setUploading(false);
    toast.success(
      `${uploaded.length} file${uploaded.length === 1 ? '' : 's'} added to local data`,
    );
  };
  const deleteUploadedFile = (name: string, uploadedAt: string) => {
    const nextFiles = uploadedFiles.filter(
      (file) => file.name !== name || file.uploadedAt !== uploadedAt,
    );
    setUploadedFiles(nextFiles);
    window.localStorage.setItem(
      'prajapatt-uploaded-files',
      JSON.stringify(nextFiles),
    );
    toast.success('File record deleted');
  };
  if (dataView === 'export')
    return (
      <ExportView
        onBack={() => setDataView('overview')}
        exportData={exportData}
      />
    );
  if (dataView === 'shared-chats')
    return <SharedChatsView onBack={() => setDataView('overview')} />;
  if (dataView === 'shared-artifacts')
    return <SharedArtifactsView onBack={() => setDataView('overview')} />;
  if (dataView === 'files')
    return (
      <UploadedFilesView
        files={uploadedFiles}
        onBack={() => setDataView('overview')}
        onDelete={deleteUploadedFile}
        onFiles={uploadFiles}
      />
    );
  if (dataView === 'feedback')
    return <FeedbackView onBack={() => setDataView('overview')} />;
  return (
    <section>
      <h2 className="text-lg font-semibold">Privacy</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
        Manage how Prajapatt uses your information and control the data stored
        in your account.
      </p>
      <div className="mt-7 space-y-1">
        <button
          type="button"
          className="flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-sm"
        >
          How we protect your data
          <ChevronRight size={16} className="text-white/40" />
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between border-b border-white/10 py-4 text-left text-sm"
        >
          How we use your data
          <ChevronRight size={16} className="text-white/40" />
        </button>
      </div>
      <h3 className="mt-8 text-lg font-semibold">Preferences</h3>
      <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
        <div className="flex items-center justify-between gap-5 py-5">
          <div>
            <p className="text-sm">Location metadata</p>
            <p className="mt-1 text-xs text-white/45">
              Allow coarse location metadata to improve product experiences.
            </p>
          </div>
          <Toggle value={location} setValue={setLocation} />
        </div>
        <div className="flex items-center justify-between gap-5 py-5">
          <div>
            <p className="text-sm">Help improve our AI models</p>
            <p className="mt-1 text-xs text-white/45">
              Allow conversations to be used to improve models.
            </p>
          </div>
          <Toggle value={improve} setValue={setImprove} />
        </div>
      </div>
      <h3 className="mt-8 text-lg font-semibold">Your data</h3>
      <div className="mt-3 border-y border-white/10">
        <DataAction
          label="Export data"
          icon={<Download size={18} />}
          action={
            <button
              type="button"
              onClick={() => setDataView('export')}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Export data
            </button>
          }
        />
        <DataAction
          label="Shared chats"
          description="Review conversation links created from your account."
          icon={<MessageSquare size={18} />}
          action={
            <button
              type="button"
              onClick={() => setDataView('shared-chats')}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Manage
            </button>
          }
        />
        <DataAction
          label="Shared artifacts"
          description="Open and manage artifacts saved in your workspace."
          icon={<FileText size={18} />}
          action={
            <button
              type="button"
              onClick={() => setDataView('shared-artifacts')}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Manage
            </button>
          }
        />
        <DataAction
          label="Uploaded files"
          description="Add local file metadata to your account workspace."
          icon={<FolderOpen size={18} />}
          action={
            <button
              type="button"
              disabled={uploading}
              onClick={() => setDataView('files')}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              Manage
            </button>
          }
        />
        <DataAction
          label="Your feedback"
          description="Send feedback directly to the Prajapatt team."
          icon={<MessageSquare size={18} />}
          action={
            <button
              type="button"
              onClick={() => setDataView('feedback')}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Manage
            </button>
          }
        />
        <DataAction
          label="Memory preferences"
          description="Control whether memory can be generated from chats."
          icon={<FolderOpen size={18} />}
          action={
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new Event('prajapatt:open-memory-settings'),
                )
              }
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Manage <ExternalLink size={14} />
            </button>
          }
        />
      </div>
    </section>
  );
}
