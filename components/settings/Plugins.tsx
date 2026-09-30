'use client';

import { ChevronDown, Globe2, Plug, Upload, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usePluginContext } from '@/context/PluginContext';

export default function PluginsPanel() {
  const { plugins } = usePluginContext();
  const [menu, setMenu] = useState(false);
  const actions = [
    { label: 'Add marketplace', icon: Globe2 },
    { label: 'Upload plugin', icon: Upload },
    { label: 'Create a plugin', icon: WandSparkles },
    { label: 'Create with Prajapatt', icon: Plug },
  ];
  return (
    <section className="flex min-h-[520px] flex-col">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Plugins</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((value) => !value)}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm"
          >
            Add <ChevronDown size={14} />
          </button>
          {menu && (
            <div className="absolute right-0 top-11 z-10 w-48 rounded-lg border border-white/10 bg-[#272727] p-1 shadow-xl">
              {actions.map(({ label, icon: Icon }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    toast.success(`${label} selected`);
                    setMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 rounded-2xl border border-white/10 p-5 text-white/40">
          <Plug size={42} />
        </div>
        <p className="text-sm text-white/60">
          {plugins.length > 0
            ? `${plugins.length} plugin${plugins.length > 1 ? 's' : ''} available in your workspace`
            : 'Give Prajapatt role-level expertise with plugins'}
        </p>
        <button
          type="button"
          onClick={() =>
            toast(
              `Plugin directory connected with ${plugins.length} saved item${plugins.length === 1 ? '' : 's'}`,
            )
          }
          className="mt-5 rounded-lg bg-white/10 px-4 py-2 text-sm"
        >
          Browse plugins
        </button>
      </div>
    </section>
  );
}
