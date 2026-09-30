'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import ConnectorsPanel from '@/components/settings/Connectors';

export default function CustomizeConnectorsPage() {
  return (
    <WorkspaceShell
      title="Customize"
      description="Connect your tools and services."
    >
      <ConnectorsPanel />
    </WorkspaceShell>
  );
}
