import React from 'react';
import {
  Check,
  Archive,
  ChevronRight,
  Folder,
  PencilLine,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

interface ChatActionItem {
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  submenu?: 'project' | 'group';
}

interface MenuProps {
  open: boolean;
  position?: { top: number; left: number };
  onClose: () => void;
  onSelect?: () => void;
  onArchive?: () => void;
  onRename?: () => void;
  onAddToProject?: (name?: string) => void;
  onMoveToGroup?: (name?: string) => void;
  onDelete?: () => void;
}

const Menu: React.FC<MenuProps> = ({
  open,
  position,
  onClose,
  onSelect,
  onArchive,
  onRename,
  onAddToProject,
  onMoveToGroup,
  onDelete,
}) => {
  const [activeSubmenu, setActiveSubmenu] = React.useState<
    'project' | 'group' | null
  >(null);
  const [submenuTop, setSubmenuTop] = React.useState(0);
  const [projects, setProjects] = React.useState<string[]>([]);
  const [groups, setGroups] = React.useState<string[]>([]);
  const [createType, setCreateType] = React.useState<
    'project' | 'group' | null
  >(null);
  const [createName, setCreateName] = React.useState('');

  if (!open) return null;

  const actions: ChatActionItem[] = [
    {
      label: 'Select',
      shortcut: 'P',
      icon: Check,
      onClick: () => {
        onSelect?.();
        onClose();
      },
    },
    {
      label: 'Rename',
      shortcut: 'R',
      icon: PencilLine,
      onClick: () => {
        onRename?.();
        onClose();
      },
    },
    {
      label: 'Archive',
      shortcut: 'E',
      icon: Archive,
      onClick: () => {
        onArchive?.();
        onClose();
      },
    },
    {
      label: 'Add to project',
      shortcut: '',
      icon: Folder,
      submenu: 'project',
      onClick: () => {
        onAddToProject?.();
      },
    },
    {
      label: 'Move to group',
      shortcut: '',
      icon: Folder,
      submenu: 'group',
      onClick: () => {
        onMoveToGroup?.();
      },
    },
    {
      label: 'Delete',
      shortcut: 'D',
      icon: Trash2,
      onClick: () => {
        onDelete?.();
        onClose();
      },
      destructive: true,
    },
  ];

  return (
    <div
      className="fixed z-[70] overflow-visible rounded-xl border border-white/10 bg-[#17171a] shadow-2xl shadow-black/40"
      style={position}
      onMouseLeave={() => setActiveSubmenu(null)}
    >
      <div className="space-y-1 p-2">
        {actions.map(
          ({ label, shortcut, icon: Icon, onClick, destructive, submenu }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              onMouseEnter={(event) => {
                if (submenu) {
                  setSubmenuTop(event.currentTarget.offsetTop);
                }
                setActiveSubmenu(submenu || null);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-xl p-2 text-left text-base font-medium transition ${
                destructive
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white/90 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${destructive ? 'text-red-400' : 'text-white/90'}`}
                />
                <span>{label}</span>
              </span>
              {shortcut && (
                <span className="text-sm text-white/40">{shortcut}</span>
              )}
              {submenu && <ChevronRight className="h-4 w-4 text-white/50" />}
            </button>
          ),
        )}
      </div>
      {activeSubmenu && (
        <div
          className="absolute left-full w-64 overflow-hidden rounded-xl border border-white/10 bg-[#202020] shadow-2xl shadow-black/40"
          style={{ top: submenuTop }}
          onMouseEnter={() => setActiveSubmenu(activeSubmenu)}
        >
          <input
            autoFocus
            type="text"
            placeholder={
              activeSubmenu === 'project'
                ? 'Search or create a project'
                : 'Search or create a group'
            }
            className="w-full border-b border-white/10 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/50"
          />
          <div className="max-h-48 overflow-y-auto p-1">
            {(activeSubmenu === 'project' ? projects : groups).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  if (activeSubmenu === 'project') {
                    onAddToProject?.(name);
                  } else {
                    onMoveToGroup?.(name);
                  }
                  onClose();
                }}
                className="w-full rounded-lg px-2 py-2 text-left text-sm text-white/90 hover:bg-white/5"
              >
                {name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setCreateType(activeSubmenu);
              setCreateName('');
            }}
            className="w-full border-t border-white/10 px-3 py-3 text-left text-sm text-white/90 hover:bg-white/5"
          >
            {activeSubmenu === 'project' ? 'New project...' : 'New group...'}
          </button>
        </div>
      )}
      {createType && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const name = createName.trim();
              if (!name) return;

              if (createType === 'project') {
                setProjects((current) =>
                  current.includes(name) ? current : [...current, name],
                );
                onAddToProject?.(name);
              } else {
                setGroups((current) =>
                  current.includes(name) ? current : [...current, name],
                );
                onMoveToGroup?.(name);
              }
              setCreateType(null);
              onClose();
            }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#202020] p-5 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white">
              New {createType}
            </h2>
            <input
              autoFocus
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder={`${createType === 'project' ? 'Project' : 'Group'} name`}
              className="mt-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateType(null)}
                className="rounded-lg px-4 py-2 text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!createName.trim()}
                className="rounded-lg bg-white px-4 py-2 text-black disabled:opacity-40"
              >
                Create and add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Menu;
