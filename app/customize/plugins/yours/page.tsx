'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import PluginsPanel from '@/components/settings/Plugins';

export default function YourPluginsPage() {
  return (
    <WorkspaceShell
      title="Your plugins"
      description="Plugins installed in your workspace."
    >
      <PluginsPanel />
    </WorkspaceShell>
  );
}
