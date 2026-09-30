'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type CapabilityPreferences = {
  toolAccess: 'Load tools when needed' | 'Tools already loaded';
  connectorSearch: boolean;
  switchModels: boolean;
  artifacts: boolean;
  aiArtifacts: boolean;
  inlineVisualizations: boolean;
  codeExecution: boolean;
  networkEgress: boolean;
};

const preferenceKey = 'prajapatt-capability-preferences';
const defaults: CapabilityPreferences = {
  toolAccess: 'Load tools when needed',
  connectorSearch: true,
  switchModels: true,
  artifacts: true,
  aiArtifacts: false,
  inlineVisualizations: true,
  codeExecution: true,
  networkEgress: true,
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? 'bg-blue-500' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`}
      />
    </button>
  );
}

function ToolAccessSelect({
  value,
  onChange,
}: {
  value: CapabilityPreferences['toolAccess'];
  onChange: (value: CapabilityPreferences['toolAccess']) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options: Array<{
    value: CapabilityPreferences['toolAccess'];
    description: string;
  }> = [
    {
      value: 'Load tools when needed',
      description: "Chats compact less since tools aren't pre-loaded.",
    },
    {
      value: 'Tools already loaded',
      description: 'Chats compact more often since tools are always there.',
    },
  ];
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-w-[230px] items-center justify-between gap-3 rounded-lg bg-white/[.07] px-3 py-2 text-sm hover:bg-white/10"
      >
        <span>{value}</span>
        <ChevronDown
          size={15}
          className={`text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+5px)] z-30 w-[290px] rounded-xl border border-white/15 bg-[#252525] p-1 shadow-2xl">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 ${value === option.value ? 'bg-white/10' : ''}`}
            >
              <span className="flex items-center justify-between text-sm">
                {option.value}
                {value === option.value && (
                  <Check size={16} className="text-blue-300" />
                )}
              </span>
              <span className="mt-1 block text-xs leading-5 text-white/50">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CapabilityRow({
  title,
  description,
  value,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-8 border-b border-white/[.07] py-5 ${disabled ? 'opacity-50' : ''}`}
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
          {description}
        </p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export default function CapabilityPanel() {
  const [preferences, setPreferences] =
    useState<CapabilityPreferences>(defaults);
  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey);
    if (saved)
      setPreferences({
        ...defaults,
        ...(JSON.parse(saved) as Partial<CapabilityPreferences>),
      });
  }, []);
  const update = <Key extends keyof CapabilityPreferences>(
    key: Key,
    value: CapabilityPreferences[Key],
  ) =>
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(preferenceKey, JSON.stringify(next));
      return next;
    });
  return (
    <section className="space-y-9">
      <div>
        <h2 className="text-lg font-semibold">General</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between gap-8 border-b border-white/[.07] py-5">
            <div>
              <p className="font-medium">Tool access mode</p>
              <p className="mt-1 text-sm text-white/50">
                Controls how connector tools are loaded in new conversations.
              </p>
            </div>
            <ToolAccessSelect
              value={preferences.toolAccess}
              onChange={(value) => update('toolAccess', value)}
            />
          </div>
          <CapabilityRow
            title="Connector search"
            description="Let Prajapatt search the connector directory and surface relevant tools to your conversation."
            value={preferences.connectorSearch}
            onChange={() =>
              update('connectorSearch', !preferences.connectorSearch)
            }
          />
          <CapabilityRow
            title="Switch models when a message is flagged"
            description="When safeguards flag a message, automatically switch to a different model to keep chatting. When off, your chat will pause instead."
            value={preferences.switchModels}
            onChange={() => update('switchModels', !preferences.switchModels)}
          />
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Visuals</h2>
        <CapabilityRow
          title="Artifacts"
          description="Generate code, documents, and designs in a dedicated window alongside your conversation."
          value={preferences.artifacts}
          onChange={() => update('artifacts', !preferences.artifacts)}
        />
        <CapabilityRow
          title="AI-powered artifacts"
          description="Build apps and interactive documents that use Prajapatt inside the artifact."
          value={preferences.aiArtifacts}
          onChange={() => update('aiArtifacts', !preferences.aiArtifacts)}
        />
        <CapabilityRow
          title="Inline visualizations"
          description="Allow Prajapatt to generate interactive visualizations, charts, and diagrams directly in the conversation."
          value={preferences.inlineVisualizations}
          onChange={() =>
            update('inlineVisualizations', !preferences.inlineVisualizations)
          }
        />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">
          Code execution and file creation
        </h2>
        <CapabilityRow
          title="Code execution and file creation"
          description="Prajapatt can execute code and create and edit documents, spreadsheets, presentations, PDFs, and data reports. Required for skills."
          value={preferences.codeExecution}
          onChange={() => update('codeExecution', !preferences.codeExecution)}
        />
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[.04] p-5">
          <CapabilityRow
            title="Allow network egress"
            description="Allow Prajapatt to access common package managers to install packages and libraries for data analysis, visualizations, and file processing. Monitor chats closely as this comes with security risks."
            value={preferences.networkEgress}
            onChange={() => update('networkEgress', !preferences.networkEgress)}
          />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Skills</h2>
        <p className="mt-3 text-sm text-white/50">
          Skills have moved to{' '}
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event('prajapatt:open-skills-settings'))
            }
            className="text-blue-300 underline"
          >
            Customize
          </button>
          .
        </p>
      </div>
    </section>
  );
}
