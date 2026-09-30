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
  PanelLeftClose,
  PanelLeftOpen,
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
  collapsed: boolean;
  onToggle: () => void;
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
  collapsed,
  onToggle,
}: SettingsSidebarProps) {
  return (
    <aside
      data-settings-sidebar
      className={`relative shrink-0 border-r border-white/10 bg-black p-3 transition-all duration-200 ${collapsed ? 'w-[58px]' : 'w-[214px]'} max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:z-10`}
    >
      <div
        className={`mb-5 flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}
      >
        {!collapsed && (
          <div className="relative min-w-0 flex-1">
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
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed ? 'Open settings sidebar' : 'Close settings sidebar'
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>
      {settingsGroups.map((group) => (
        <div key={group.label} className={`mb-5 ${collapsed ? 'hidden' : ''}`}>
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
