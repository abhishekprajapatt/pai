'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import PluginsPanel from '@/components/settings/Plugins';

export default function CustomizePluginsPage() {
  return (
    <WorkspaceShell
      title="Customize"
      description="Extend Prajapatt with plugins."
    >
      <PluginsPanel />
    </WorkspaceShell>
  );
}
