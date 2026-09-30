'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const breakHours = [
  '',
  ...Array.from({ length: 12 }, (_, index) => `${index + 1} hr`),
];
const breakMinutes = ['', '15 min', '30 min', '45 min'];
const times = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
});

type Schedule = { start: string; end: string };
type Schedules = Record<string, Schedule>;

const storageKey = 'prajapatt-time-focus';

function Dropdown({
  value,
  options,
  label,
  onChange,
  className = 'w-[106px]',
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-white/15 bg-white/[.06] px-3 text-left text-sm font-medium text-white/90 transition hover:border-white/25"
      >
        <span>{value || '-'}</span>
        <ChevronDown size={18} className="text-white/55" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            aria-label={label}
            className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-[280px] w-full min-w-[158px] overflow-y-auto rounded-xl border border-white/15 bg-[#222] p-1.5 shadow-2xl [scrollbar-color:#777_transparent]"
          >
            {options.map((option) => (
              <button
                key={option || 'empty'}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="flex h-11 w-full items-center justify-between rounded-lg px-3 text-left text-base text-white/90 transition hover:bg-white/10 aria-selected:bg-white/[.08]"
              >
                <span>{option || '-'}</span>
                {option === value && (
                  <Check size={20} className="text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TimeFocusPanel() {
  const [breakInterval, setBreakInterval] = useState('');
  const [breakDuration, setBreakDuration] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedules>({});

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const preferences = JSON.parse(saved) as {
        breakInterval?: string;
        breakDuration?: string;
        selectedDays?: string[];
        schedules?: Schedules;
      };
      setBreakInterval(preferences.breakInterval || '');
      setBreakDuration(preferences.breakDuration || '');
      setSelectedDays(preferences.selectedDays || []);
      setSchedules(preferences.schedules || {});
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ breakInterval, breakDuration, selectedDays, schedules }),
    );
  }, [breakInterval, breakDuration, selectedDays, schedules]);

  const toggleDay = (day: string) => {
    setSelectedDays((current) => {
      if (current.includes(day)) return current.filter((item) => item !== day);
      return [...current, day];
    });
  };

  const updateSchedule = (
    day: string,
    field: keyof Schedule,
    value: string,
  ) => {
    setSchedules((current) => ({
      ...current,
      [day]: {
        start: current[day]?.start || '',
        end: current[day]?.end || '',
        [field]: value,
      },
    }));
  };

  return (
    <section className="text-white">
      <h2 className="text-lg font-semibold">Time and focus</h2>

      <div className="mt-8 divide-y divide-white/[.07] border-y border-white/[.07]">
        <div className="flex items-start justify-between gap-6 py-5">
          <div>
            <p className="font-medium">Break reminders</p>
            <p className="mt-1 text-sm text-white/50">
              Get a nudge to take a break from Prajapatt. You can snooze or
              adjust anytime.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Dropdown
              value={breakInterval}
              options={breakHours}
              label="Break interval"
              onChange={setBreakInterval}
            />
            <Dropdown
              value={breakDuration}
              options={breakMinutes}
              label="Break duration"
              onChange={setBreakDuration}
            />
          </div>
        </div>

        <div className="py-5">
          <p className="font-medium">Quiet hours</p>
          <p className="mt-1 text-sm text-white/50">
            Set time limits for Prajapatt. You can dismiss or adjust anytime.
          </p>
          <div className="mt-5 flex gap-3">
            {days.map((day, index) => {
              const selected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-label={day}
                  aria-pressed={selected}
                  onClick={() => toggleDay(day)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium transition ${selected ? 'bg-white text-black' : 'bg-white/[.10] text-white/45 hover:bg-white/[.16]'}`}
                >
                  {dayLetters[index]}
                </button>
              );
            })}
          </div>

          {selectedDays.map((day) => (
            <div
              key={day}
              className="mt-5 flex items-center gap-4 border-t border-white/[.07] pt-4 text-sm"
            >
              <span className="w-[132px] shrink-0 font-medium">{day}</span>
              <Dropdown
                value={schedules[day]?.start || ''}
                options={times}
                label={`${day} quiet hours start`}
                onChange={(value) => updateSchedule(day, 'start', value)}
                className="w-[192px]"
              />
              <span className="text-white/45">to</span>
              <Dropdown
                value={schedules[day]?.end || ''}
                options={times}
                label={`${day} quiet hours end`}
                onChange={(value) => updateSchedule(day, 'end', value)}
                className="w-[192px]"
              />
              <span className="whitespace-nowrap text-white/45">next day</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
