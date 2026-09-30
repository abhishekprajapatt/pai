'use client';

import { useEffect, useState } from 'react';
export default function MemoryPanel() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(window.localStorage.getItem('prajapatt-memory') === 'true');
  }, []);
  const toggle = () => {
    setEnabled((value) => {
      const next = !value;
      window.localStorage.setItem('prajapatt-memory', String(next));
      return next;
    });
  };
  return (
    <section>
      <h2 className="text-lg font-semibold">Memory</h2>
      <div className="mt-7 flex items-start justify-between border-b border-white/10 pb-6">
        <div>
          <h3 className="font-medium">Generate memory from chats</h3>
          <p className="mt-1 text-sm text-white/50">
            Allow Prajapatt to generate memory from your chats.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-blue-500' : 'bg-white/15'}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>
    </section>
  );
}
