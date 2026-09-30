'use client';

import {
  ArrowUpRight,
  Lightbulb,
  NotebookPen,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';

interface Reflection {
  id: string;
  text: string;
  createdAt: string;
}

const reflectionsKey = 'prajapatt-reflections';
const suggestionsKey = 'prajapatt-reflection-suggestions';

export default function ReflectPanel() {
  const { chats } = useAppContext();
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    setMemoryEnabled(
      window.localStorage.getItem('prajapatt-memory') === 'true',
    );
    setSuggestionsEnabled(
      window.localStorage.getItem(suggestionsKey) === 'true',
    );
    const saved = window.localStorage.getItem(reflectionsKey);
    if (saved) setReflections(JSON.parse(saved) as Reflection[]);
  }, []);

  const openMemorySettings = () => {
    window.dispatchEvent(new Event('prajapatt:open-memory-settings'));
  };

  const toggleSuggestions = () => {
    setSuggestionsEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(suggestionsKey, String(next));
      return next;
    });
  };

  const saveReflection = () => {
    const latestChat = chats?.find((chat) => chat.messages?.length);
    const latestMessage =
      latestChat?.messages?.[latestChat.messages.length - 1];
    if (!latestMessage) {
      toast('Start a conversation before saving a reflection');
      return;
    }
    const next = [
      {
        id: crypto.randomUUID(),
        text: latestMessage.content.slice(0, 240),
        createdAt: new Date().toISOString(),
      },
      ...reflections,
    ];
    setReflections(next);
    window.localStorage.setItem(reflectionsKey, JSON.stringify(next));
    toast.success('Reflection saved');
  };

  if (!memoryEnabled) {
    return (
      <section className="min-h-[560px]">
        <h2 className="text-lg font-semibold">Reflect</h2>
        <p className="mt-3 text-sm text-white/60">
          Based on your conversations in Prajapatt chat.
        </p>
        <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
          <div className="mb-8 text-white/80">
            <NotebookPen size={84} strokeWidth={1.2} />
          </div>
          <p className="max-w-md text-base leading-6 text-white/65">
            For this reflection to work, you will need to enable memory in{' '}
            <button
              type="button"
              onClick={openMemorySettings}
              className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
            >
              memory settings
            </button>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Reflect</h2>
          <p className="mt-3 text-sm text-white/60">
            Based on your conversations in Prajapatt chat.
          </p>
        </div>
        <button
          type="button"
          onClick={saveReflection}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
        >
          <Plus size={15} />
          Save latest
        </button>
      </div>
      <div className="mt-8 flex items-center justify-between border-y border-white/10 py-5">
        <div>
          <p className="font-medium">Suggest reflections</p>
          <p className="mt-1 text-sm text-white/45">
            Show a reflection prompt after meaningful conversations.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={suggestionsEnabled}
          onClick={toggleSuggestions}
          className={`relative h-6 w-11 rounded-full ${suggestionsEnabled ? 'bg-blue-500' : 'bg-white/15'}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${suggestionsEnabled ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-white/55" />
          <h3 className="font-medium">Saved reflections</h3>
        </div>
        {reflections.length === 0 ? (
          <div className="mt-5 rounded-xl border border-white/10 p-8 text-center text-sm text-white/45">
            No reflections saved yet. Save the latest conversation to start.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {reflections.map((reflection) => (
              <article
                key={reflection.id}
                className="rounded-xl border border-white/10 bg-white/[.03] p-4"
              >
                <p className="text-sm leading-6 text-white/75">
                  {reflection.text}
                </p>
                <p className="mt-3 text-xs text-white/35">
                  {new Date(reflection.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setReflections([]);
          window.localStorage.removeItem(reflectionsKey);
          toast.success('Reflections cleared');
        }}
        className="mt-8 flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <RotateCcw size={15} />
        Clear reflections
      </button>
      <button
        type="button"
        onClick={openMemorySettings}
        className="mt-6 flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
      >
        Memory settings <ArrowUpRight size={14} />
      </button>
    </section>
  );
}
