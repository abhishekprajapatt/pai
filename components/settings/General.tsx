'use client';

import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import { useFirebaseAuth } from '@/context/AuthContext';

type Preferences = {
  fullName: string;
  preferredName: string;
  workType: string;
  instructions: string;
  appearance: 'system' | 'light' | 'dark';
  font: 'Prajapatt Serif' | 'Prajapatt Sans' | 'System' | 'Dyslexic friendly';
  motion: 'system' | 'reduced';
  voiceLanguage: string;
  voiceStyle: 'Buttery' | 'Airy' | 'Mellow' | 'Glassy' | 'Rounded';
  voiceSpeed: 'Slow' | 'Normal' | 'Fast';
  responseNotifications: boolean;
  improveModel: boolean;
};

const defaultPreferences: Preferences = {
  fullName: '',
  preferredName: '',
  workType: '',
  instructions: '',
  appearance: 'system',
  font: 'Prajapatt Serif',
  motion: 'system',
  voiceLanguage: 'English',
  voiceStyle: 'Buttery',
  voiceSpeed: 'Normal',
  responseNotifications: false,
  improveModel: true,
};

const preferenceKey = 'prajapatt-general-preferences';

function SelectControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const displayValue = options.includes(value) ? value : options[0];

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <div ref={controlRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-w-[116px] items-center justify-end gap-2 rounded-lg px-3 py-2 text-right text-sm text-white transition hover:bg-white/[.08] focus:outline-none focus:ring-1 focus:ring-white/30"
      >
        <span
          className={`truncate ${displayValue === 'Prajapatt Serif' ? 'font-serif' : ''}`}
        >
          {displayValue}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-white/45 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Select an option"
          className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-[180px] overflow-hidden rounded-lg border border-white/15 bg-[#292929] p-1 text-left shadow-2xl"
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={displayValue === option}
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${displayValue === option ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <span
                className={option === 'Prajapatt Serif' ? 'font-serif' : ''}
              >
                {option}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GeneralPanel() {
  const { user } = useFirebaseAuth();
  const { setDetectedLang } = useAppContext();
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey);
    if (saved) {
      const stored = JSON.parse(saved) as Partial<Omit<Preferences, 'font'>> & {
        font?: string;
      };
      const validFonts: Preferences['font'][] = [
        'Prajapatt Serif',
        'Prajapatt Sans',
        'System',
        'Dyslexic friendly',
      ];
      const migratedFont =
        stored.font === 'Inter' ||
        !validFonts.includes(stored.font as Preferences['font'])
          ? 'Prajapatt Serif'
          : stored.font;
      const validLanguages = ['English', 'Hindi', 'Sanskrit', 'Bhojpuri'];
      const validVoiceStyles = [
        'Buttery',
        'Airy',
        'Mellow',
        'Glassy',
        'Rounded',
      ];
      const migratedPreferences = {
        ...defaultPreferences,
        ...stored,
        font: migratedFont as Preferences['font'],
        voiceLanguage: validLanguages.includes(stored.voiceLanguage || '')
          ? stored.voiceLanguage || defaultPreferences.voiceLanguage
          : defaultPreferences.voiceLanguage,
        voiceStyle: validVoiceStyles.includes(stored.voiceStyle || '')
          ? (stored.voiceStyle as Preferences['voiceStyle'])
          : defaultPreferences.voiceStyle,
      };
      setPreferences(migratedPreferences);
      window.localStorage.setItem(
        preferenceKey,
        JSON.stringify(migratedPreferences),
      );
    }
  }, []);

  const update = <Key extends keyof Preferences>(
    key: Key,
    value: Preferences[Key],
  ) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(preferenceKey, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const applyTheme = () => {
      const isLight =
        preferences.appearance === 'light' ||
        (preferences.appearance === 'system' && mediaQuery.matches);
      const theme = isLight ? 'light' : 'dark';
      document.documentElement.dataset.appearance = theme;
      document.documentElement.style.colorScheme = theme;
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [preferences.appearance]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'reduce-motion',
      preferences.motion === 'reduced',
    );
  }, [preferences.motion]);

  useEffect(() => {
    const fontFamily = {
      'Prajapatt Serif': 'Georgia, "Times New Roman", serif',
      'Prajapatt Sans': 'system-ui, sans-serif',
      System: 'system-ui, sans-serif',
      'Dyslexic friendly': 'Verdana, Arial, sans-serif',
    }[preferences.font];
    document.documentElement.style.setProperty(
      '--prajapatt-chat-font',
      fontFamily,
    );
  }, [preferences.font]);

  const updateLanguage = (language: string) => {
    update('voiceLanguage', language);
    setDetectedLang(
      language === 'Hindi'
        ? 'hi-IN'
        : language === 'Sanskrit'
          ? 'sa-IN'
          : language === 'Bhojpuri'
            ? 'hi-IN'
            : 'en-US',
    );
    toast.success(`Language changed to ${language}`);
  };

  return (
    <section
      className={`space-y-9 ${preferences.font === 'Prajapatt Serif' ? 'font-serif' : ''}`}
      style={{ fontFamily: 'var(--prajapatt-chat-font)' }}
    >
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Avatar</span>
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile avatar"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-medium">
              {(user?.displayName || preferences.fullName || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Full name</span>
          <input
            value={preferences.fullName || user?.displayName || ''}
            onChange={(event) => update('fullName', event.target.value)}
            placeholder="Your full name"
            className="w-60 rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>What should Prajapatt call you?</span>
          <input
            value={preferences.preferredName}
            onChange={(event) => update('preferredName', event.target.value)}
            placeholder="Your preferred name"
            className="w-60 rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>What best describes your work?</span>
          <SelectControl
            value={preferences.workType || 'Select'}
            options={[
              'Select',
              'Student',
              'Developer',
              'Designer',
              'Researcher',
              'Business owner',
            ]}
            onChange={(value) =>
              update('workType', value === 'Select' ? '' : value)
            }
          />
        </div>
        <div className="border-b border-white/[.07] py-4">
          <p className="text-sm font-medium">Instructions for Prajapatt</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Prajapatt will keep these in mind for your conversations and
            associated workspaces.
          </p>
          <textarea
            value={preferences.instructions}
            onChange={(event) => update('instructions', event.target.value)}
            placeholder="e.g. keep explanations brief and to the point"
            rows={4}
            className="mt-4 w-full resize-y rounded-lg border border-white/10 bg-white/[.06] px-3 py-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Preferences</h2>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Appearance</span>
          <div className="flex items-center gap-1 rounded-lg bg-white/[.07] p-1">
            {(
              [
                { id: 'system', icon: Monitor },
                { id: 'light', icon: Sun },
                { id: 'dark', icon: Moon },
              ] as const
            ).map(({ id, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => update('appearance', id)}
                aria-label={`${id} appearance`}
                className={`rounded-md p-2 ${preferences.appearance === id ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Chat font</span>
          <SelectControl
            value={preferences.font}
            options={[
              'Prajapatt Serif',
              'Prajapatt Sans',
              'System',
              'Dyslexic friendly',
            ]}
            onChange={(value) => update('font', value as Preferences['font'])}
          />
        </div>
        <div className="flex min-h-[72px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <div>
            <p className="text-sm font-medium">Motion</p>
            <p className="mt-1 text-sm text-white/45">
              Reduce animation in streaming responses and other interface
              elements.
            </p>
          </div>
          <div className="flex rounded-lg bg-white/[.07] p-1">
            {(['system', 'reduced'] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => update('motion', value)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${preferences.motion === value ? 'bg-white/15 text-white' : 'text-white/45'}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Voice</h2>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Language</span>
          <SelectControl
            value={preferences.voiceLanguage}
            options={['English', 'Hindi', 'Sanskrit', 'Bhojpuri']}
            onChange={updateLanguage}
          />
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Style</span>
          <SelectControl
            value={preferences.voiceStyle}
            options={['Buttery', 'Airy', 'Mellow', 'Glassy', 'Rounded']}
            onChange={(value) =>
              update('voiceStyle', value as Preferences['voiceStyle'])
            }
          />
        </div>
        <div className="flex min-h-[58px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <span>Speed</span>
          <SelectControl
            value={preferences.voiceSpeed}
            options={['Slow', 'Normal', 'Fast']}
            onChange={(value) =>
              update('voiceSpeed', value as Preferences['voiceSpeed'])
            }
          />
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Notifications</h2>
        <div className="flex min-h-[72px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <div>
            <p className="text-sm font-medium">Response completions</p>
            <p className="mt-1 text-sm text-white/45">
              Get notified when Prajapatt has finished a response. Useful for
              long-running tasks.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.responseNotifications}
            onClick={() =>
              update(
                'responseNotifications',
                !preferences.responseNotifications,
              )
            }
            className={`relative h-6 w-11 shrink-0 rounded-full ${preferences.responseNotifications ? 'bg-blue-500' : 'bg-white/15'}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${preferences.responseNotifications ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>
        <div className="flex min-h-[72px] items-center justify-between gap-8 border-b border-white/[.07] py-4">
          <div>
            <p className="text-sm font-medium">Improve AI models</p>
            <p className="mt-1 text-sm text-white/45">
              Share conversations to help improve model quality.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.improveModel}
            onChange={(event) => update('improveModel', event.target.checked)}
            className="h-5 w-5 accent-blue-500"
          />
        </div>
      </div>
    </section>
  );
}
