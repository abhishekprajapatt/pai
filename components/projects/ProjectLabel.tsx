import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

import { assets } from '@/public/assets/assets';
import Menu from '@/components/cards/Menu';

interface OpenMenu {
  id: string | number;
  open: boolean;
}

interface ProjectLabelProps {
  id: string;
  name: string;
  openMenu: OpenMenu;
  setOpenMenu: (menu: OpenMenu) => void;
}

const ProjectLabel: React.FC<ProjectLabelProps> = ({
  id,
  name,
  openMenu,
  setOpenMenu,
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const selectProject = () => {
    router.push(`/projects/${id}`);
  };

  return (
    <div className="group relative my-0.5 flex items-center justify-between rounded-xl border border-transparent px-2 py-1 text-sm text-white/80 transition hover:bg-white/5">
      <button
        type="button"
        onClick={selectProject}
        className="min-w-0 flex-1 truncate text-left font-normal text-white/90"
      >
        {name}
      </button>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const menuWidth = 256;
            const menuHeight = 360;
            const left = Math.max(
              12,
              Math.min(
                rect.right - menuWidth + 12,
                window.innerWidth - menuWidth - 8,
              ),
            );
            const top =
              rect.bottom + menuHeight > window.innerHeight
                ? Math.max(8, rect.top - menuHeight)
                : rect.bottom + 8;

            setMenuPosition({ top, left });
            setOpenMenu({ id, open: !(openMenu.id === id && openMenu.open) });
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-white/70 opacity-0 transition group-hover:opacity-100 hover:border-white/10 hover:bg-black/20 ${
            openMenu.id === id && openMenu.open ? 'opacity-100' : ''
          }`}
          aria-label="Open project actions"
        >
          <Image
            src={assets.three_dots as string}
            alt="Menu"
            width={18}
            height={18}
            className={`w-4 ${
              openMenu.id === id && openMenu.open ? 'opacity-100' : 'opacity-80'
            }`}
          />
        </button>

        <Menu
          open={openMenu.id === id && openMenu.open}
          position={menuPosition}
          onClose={() => setOpenMenu({ id: 0, open: false })}
          onSelect={selectProject}
          onArchive={() => toast.success('Project archived')}
          onRename={() => toast.success('Rename project')}
          onAddToProject={(projectName) =>
            toast.success(
              projectName
                ? `Project added to ${projectName}`
                : 'Add to project',
            )
          }
          onMoveToGroup={(groupName) =>
            toast.success(
              groupName ? `Project moved to ${groupName}` : 'Move to group',
            )
          }
          onDelete={() => toast.success('Delete project')}
        />
      </div>
    </div>
  );
};

export default ProjectLabel;
