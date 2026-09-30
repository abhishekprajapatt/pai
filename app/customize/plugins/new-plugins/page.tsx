'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import PluginsPanel from '@/components/settings/Plugins';

export default function NewPluginsPage() {
  return (
    <WorkspaceShell
      title="New plugins"
      description="Discover the newest plugins."
    >
      <PluginsPanel />
    </WorkspaceShell>
  );
}
