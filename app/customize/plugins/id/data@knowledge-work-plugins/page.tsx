'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import PluginsPanel from '@/components/settings/Plugins';

export default function KnowledgeWorkPluginsPage() {
  return (
    <WorkspaceShell title="Data" description="Knowledge work plugins.">
      <PluginsPanel />
    </WorkspaceShell>
  );
}
