'use client';

import WorkspaceShell from '@/components/projects/WorkspaceShell';
import SkillsPanel from '@/components/settings/Skills';

export default function CustomizeSkillsPage() {
  return (
    <WorkspaceShell title="Customize" description="Skills for your workspace.">
      <SkillsPanel />
    </WorkspaceShell>
  );
}
