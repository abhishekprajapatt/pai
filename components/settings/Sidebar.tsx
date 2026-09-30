'use client';

import {
  Search,
  Settings2,
  UserCircle,
  Shield,
  CreditCard,
  BriefcaseBusiness,
  Bell,
  Moon,
  Code2,
  Blocks,
  Plug,
  Brain,
} from 'lucide-react';

export type SettingsTab =
  | 'general'
  | 'account'
  | 'privacy'
  | 'billing'
  | 'capabilities'
  | 'reflect'
  | 'time'
  | 'code'
  | 'skills'
  | 'connectors'
  | 'plugins'
  | 'memory'
  | 'models';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const settingsGroups = [
  {
    label: 'Settings',
    items: [
      { id: 'general', label: 'General', icon: Settings2 },
      { id: 'account', label: 'Account', icon: UserCircle },
      { id: 'privacy', label: 'Privacy', icon: Shield },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'capabilities', label: 'Capabilities', icon: BriefcaseBusiness },
      { id: 'reflect', label: 'Reflect', icon: Bell },
      { id: 'time', label: 'Time and focus', icon: Moon },
      { id: 'code', label: 'Prajapatt Code', icon: Code2 },
      { id: 'models', label: 'AI Models', icon: Blocks },
    ],
  },
  {
    label: 'Customize',
    items: [
      { id: 'skills', label: 'Skills', icon: Blocks },
      { id: 'connectors', label: 'Connectors', icon: Plug },
      { id: 'plugins', label: 'Plugins', icon: Blocks },
      { id: 'memory', label: 'Memory', icon: Brain },
    ],
  },
] as const;

export default function SettingsSidebar({
  activeTab,
  onChange,
  search,
  onSearchChange,
}: SettingsSidebarProps) {
  return (
    <aside
      data-settings-sidebar
      className="w-[214px] shrink-0 border-r border-white/10 bg-black p-3"
    >
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          className="w-full rounded-lg border border-white/10 bg-white/[.05] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-white/40 focus:border-white/25"
        />
      </div>
      {settingsGroups.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="px-3 pb-2 text-xs text-white/40">{group.label}</p>
          {group.items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${activeTab === id ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/[.07] hover:text-white'}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
