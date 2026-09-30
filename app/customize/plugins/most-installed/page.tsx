'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import PluginsPanel from '@/components/settings/Plugins';

export default function MostInstalledPluginsPage() {
  return (
    <WorkspaceShell
      title="Most installed plugins"
      description="Browse popular plugins."
    >
      <PluginsPanel />
    </WorkspaceShell>
  );
}
