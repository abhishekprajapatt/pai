'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import SettingsSidebar, {
  type SettingsTab,
} from '@/components/settings/Sidebar';
import AccountPanel from '@/components/settings/Account';
import BillingPanel from '@/components/settings/Billing';
import CapabilityPanel from '@/components/settings/Capability';
import CodePanel from '@/components/settings/Code';
import ConnectorsPanel from '@/components/settings/Connectors';
import GeneralPanel from '@/components/settings/General';
import MemoryPanel from '@/components/settings/Memory';
import ModelsPanel from '@/components/settings/Models';
import PluginsPanel from '@/components/settings/Plugins';
import PrivacyPanel from '@/components/settings/Privacy';
import ReflectPanel from '@/components/settings/Reflect';
import SkillsPanel from '@/components/settings/Skills';
import TimeFocusPanel from '@/components/settings/TimeFocus';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [search, setSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const openMemorySettings = () => setActiveTab('memory');
    const openSkillsSettings = () => setActiveTab('skills');
    document.addEventListener('keydown', handleEscape);
    window.addEventListener(
      'prajapatt:open-memory-settings',
      openMemorySettings,
    );
    window.addEventListener(
      'prajapatt:open-skills-settings',
      openSkillsSettings,
    );
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener(
        'prajapatt:open-memory-settings',
        openMemorySettings,
      );
      window.removeEventListener(
        'prajapatt:open-skills-settings',
        openSkillsSettings,
      );
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      !modalRef.current?.contains(event.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const panel: Record<SettingsTab, React.ReactNode> = {
    general: <GeneralPanel />,
    account: <AccountPanel />,
    privacy: <PrivacyPanel />,
    billing: <BillingPanel />,
    capabilities: <CapabilityPanel />,
    reflect: <ReflectPanel />,
    time: <TimeFocusPanel />,
    code: <CodePanel />,
    skills: <SkillsPanel />,
    connectors: <ConnectorsPanel />,
    plugins: <PluginsPanel />,
    memory: <MemoryPanel />,
    models: <ModelsPanel />,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black p-2 backdrop-blur-sm md:p-5"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        data-settings-surface
        className="flex h-[min(760px,94vh)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
      >
        <SettingsSidebar
          activeTab={activeTab}
          onChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          {panel[activeTab]}
        </main>
      </div>
    </div>
  );
}
