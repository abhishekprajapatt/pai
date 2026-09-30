'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useConnectorsContext } from '@/context/ConnectorsContext';

type ConnectorItem = {
  name: string;
  description: string;
  websiteUrl?: string;
};

const catalog: ConnectorItem[] = [
  {
    name: 'Gmail',
    description: 'Draft replies, summarize threads, and search your inbox',
    websiteUrl: 'https://mail.google.com/',
  },
  {
    name: 'Google Drive',
    description: 'Search, read, and upload files instantly',
    websiteUrl: 'https://drive.google.com/',
  },
  {
    name: 'Google Calendar',
    description: 'Manage your schedule and coordinate meetings effortlessly',
    websiteUrl: 'https://calendar.google.com/',
  },
  {
    name: 'GitHub',
    description: 'Search repositories, issues, and pull requests',
    websiteUrl: 'https://github.com/',
  },
  {
    name: 'Slack',
    description: 'Send messages, create canvases, and fetch Slack data',
    websiteUrl: 'https://slack.com/',
  },
  {
    name: 'Notion',
    description:
      'Connect your Notion workspace to search, update, and power workflows',
    websiteUrl: 'https://www.notion.so/',
  },
];

function getWebsiteDomain(websiteUrl?: string): string | null {
  if (!websiteUrl) return null;

  try {
    return new URL(websiteUrl).hostname;
  } catch {
    return null;
  }
}

function getLogoSource(item: ConnectorItem): string {
  if (item.websiteUrl) {
    const domain = getWebsiteDomain(item.websiteUrl);
    if (domain) {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }
  }
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(item.name)}.ico`;
}

function getFallbackLogoSource(
  item: ConnectorItem,
  currentSource: string,
): string | null {
  const domain = item.websiteUrl ? getWebsiteDomain(item.websiteUrl) : null;
  const fallback = domain
    ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`
    : null;
  return fallback && currentSource !== fallback ? fallback : null;
}

function ConnectorLogo({ item }: { item: ConnectorItem }) {
  const [logoSource, setLogoSource] = useState(() => getLogoSource(item));

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
      <img
        src={logoSource}
        alt={`${item.name} logo`}
        loading="lazy"
        className="h-full w-full object-contain p-1.5"
        onError={() => {
          const fallback = getFallbackLogoSource(item, logoSource);
          if (fallback) setLogoSource(fallback);
        }}
      />
    </div>
  );
}

export default function ConnectorsPanel() {
  const { connectors, createConnector, deleteConnector } =
    useConnectorsContext();
  const [query, setQuery] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    setConnected(
      connectors
        .filter((connector) => connector.status === 'connected')
        .map((connector) => connector.name),
    );
  }, [connectors]);

  const visibleItems = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return catalog;

    return catalog.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(text),
    );
  }, [query]);

  const toggleConnector = async (name: string) => {
    const existing = connectors.find((connector) => connector.name === name);
    if (existing) {
      await deleteConnector(existing._id ?? existing.id ?? name);
      setConnected((current) => current.filter((item) => item !== name));
      return;
    }

    await createConnector({
      name,
      description: `${name} connector`,
      type: 'custom',
      status: 'connected',
      icon: '',
      config: { websiteUrl: customUrl || 'https://example.com' },
    });

    setConnected((current) =>
      current.includes(name) ? current : [...current, name],
    );
  };

  const addCustomConnector = async () => {
    if (!customName.trim() || !customUrl.trim()) return;

    const name = customName.trim();
    const existing = connectors.find((connector) => connector.name === name);

    if (existing) {
      setCustomName('');
      setCustomUrl('');
      setCustomOpen(false);
      return;
    }

    await createConnector({
      name,
      description: 'Custom connector',
      type: 'custom',
      status: 'connected',
      icon: '',
      config: { websiteUrl: customUrl },
    });

    setConnected((current) =>
      current.includes(name) ? current : [...current, name],
    );
    setCustomName('');
    setCustomUrl('');
    setCustomOpen(false);
  };

  return (
    <section className="">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 md:px-6">
        <h2 className="text-[2rem] font-semibold leading-none text-white">
          Connectors
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
          >
            <Search size={14} />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]"
          >
            <span>Add</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#3d8bff] bg-[#0d1722] px-3 py-2.5">
          <Search size={16} className="text-white/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search connectors"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/45 focus:outline-none"
          />
        </div>

        <div className="space-y-0">
          {visibleItems.map((item) => {
            const active = connected.includes(item.name);

            return (
              <div
                key={item.name}
                className="flex items-center gap-3 border-b border-white/10 px-3 py-4 last:border-b-0"
              >
                <ConnectorLogo item={item} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[1.05rem] font-medium text-white">
                    {item.name}
                  </div>
                  <div className="mt-1 truncate text-sm text-white/55">
                    {/* {item.description} */}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleConnector(item.name)}
                  className={`min-w-[110px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-white/10 bg-white/[0.06] text-white/85'
                      : 'border-white/10 bg-transparent text-white/75 hover:bg-white/[0.04]'
                  }`}
                >
                  {active ? 'Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>

        {!visibleItems.length && (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
            No connectors match your search.
          </div>
        )}
      </div>

      {customOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1b1f25] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">
                Add custom connector
              </h3>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-white/80 hover:bg-white/[0.08]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-5 text-base leading-7 text-white/70">
              Connect Claude to your data and tools. Learn more about connectors
              or get started with pre-built ones.
            </p>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-white/75">Name</span>
                <input
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  placeholder="Name"
                  className="w-full rounded-xl border border-white/10 bg-[#101821] px-3 py-3 text-white placeholder:text-white/45 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/75">
                  Remote MCP server URL
                </span>
                <input
                  value={customUrl}
                  onChange={(event) => setCustomUrl(event.target.value)}
                  placeholder="https://mcp.example.com/mcp"
                  className="w-full rounded-xl border border-white/10 bg-[#101821] px-3 py-3 text-white placeholder:text-white/45 focus:outline-none"
                />
              </label>
            </div>

            <p className="mt-6 text-sm leading-6 text-white/55">
              Only use connectors from developers you trust. Anthropic does not
              control which tools developers make available and cannot verify
              that they will work as intended or that they won&apos;t change.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addCustomConnector}
                disabled={!customName.trim() || !customUrl.trim()}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
