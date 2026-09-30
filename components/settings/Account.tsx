'use client';

import Image from 'next/image';
import { deleteUser } from 'firebase/auth';
import {
  Clock3,
  Copy,
  LogOut,
  MoreVertical,
  Shield,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '@/firebase/firebase';
import { useFirebaseAuth } from '@/context/AuthContext';

function getDeviceName() {
  if (typeof navigator === 'undefined') return 'Current browser';
  const agent = navigator.userAgent;
  const browser = agent.includes('Edg/')
    ? 'Edge'
    : agent.includes('Chrome')
      ? 'Chrome'
      : agent.includes('Firefox')
        ? 'Firefox'
        : agent.includes('Safari')
          ? 'Safari'
          : 'Browser';
  const platform = agent.includes('Windows')
    ? 'Windows'
    : agent.includes('Mac')
      ? 'macOS'
      : agent.includes('Linux')
        ? 'Linux'
        : agent.includes('Android')
          ? 'Android'
          : agent.includes('iPhone')
            ? 'iPhone'
            : 'Device';
  return `${browser} (${platform})`;
}

export default function AccountPanel() {
  const { user, signOut } = useFirebaseAuth();
  const [now, setNow] = useState<Date | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const deviceName = useMemo(getDeviceName, []);
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  useEffect(() => setNow(new Date()), []);

  const logout = async () => {
    try {
      await signOut();
      toast.success('Logged out');
    } catch {
      toast.error('Unable to log out');
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        'Delete your account and all associated chats? This cannot be undone.',
      )
    )
      return;
    const currentUser = auth.currentUser;
    if (!currentUser) return toast.error('No active account found');
    setDeleting(true);
    try {
      const chatsResponse = await fetch('/api/user/delete-all-chats', {
        method: 'DELETE',
      });
      if (!chatsResponse.ok) throw new Error('Unable to remove chats');
      await deleteUser(currentUser);
      toast.success('Account deleted');
    } catch (error) {
      toast.error(
        error instanceof Error &&
          error.message.includes('requires-recent-login')
          ? 'Please sign in again before deleting your account'
          : error instanceof Error
            ? error.message
            : 'Unable to delete account',
      );
    } finally {
      setDeleting(false);
    }
  };

  const copyOrganizationId = async () => {
    if (!user?.uid) return;
    await navigator.clipboard.writeText(user.uid);
    toast.success('Organization ID copied');
  };

  return (
    <section>
      <h2 className="text-lg font-semibold">Account</h2>
      <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <p className="font-medium">Log out of all devices</p>
            <p className="mt-1 text-sm text-white/45">
              End this active Firebase session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <p className="font-medium">Delete your account</p>
            <p className="mt-1 text-sm text-white/45">
              Permanently remove your chats and Firebase account.
            </p>
          </div>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void deleteAccount()}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-black disabled:opacity-50"
          >
            <Trash2 size={15} />
            {deleting ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
        <div className="flex items-center justify-between gap-6 py-5">
          <div>
            <p className="font-medium">Organization ID</p>
            <p className="mt-1 text-sm text-white/45">
              Your Firebase user ID for this account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyOrganizationId()}
            className="flex max-w-[58%] items-center gap-2 truncate rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70"
          >
            <span className="truncate">{user?.uid || 'Not signed in'}</span>
            <Copy size={14} className="shrink-0" />
          </button>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-white/60" />
          <h3 className="font-medium">Trusted devices</h3>
        </div>
        <p className="mt-2 text-sm text-white/50">
          Devices that can control your local machine through remote sessions.
        </p>
        <p className="mt-6 text-sm text-white/40">No trusted devices.</p>
      </div>
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-white/60" />
          <h3 className="font-medium">Active sessions</h3>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="grid min-w-[620px] grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-white/10 pb-3 text-sm text-white/50">
            <span>Device</span>
            <span>Location</span>
            <span>Created</span>
            <span>Updated</span>
          </div>
          <div className="group relative grid min-w-[620px] grid-cols-[1.2fr_1fr_1fr_1fr] items-center rounded-lg py-4 text-sm transition hover:bg-white/[.08]">
            <span className="flex items-center gap-2 truncate">
              {deviceName}
              <span className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                Current
              </span>
            </span>
            <span className="truncate text-white/65">{timeZone}</span>
            <span className="text-white/65">
              {now ? now.toLocaleString() : 'Loading...'}
            </span>
            <span className="text-white/65">
              {now ? now.toLocaleString() : 'Loading...'}
            </span>
            <button
              type="button"
              aria-label="Session actions"
              aria-expanded={sessionMenuOpen}
              onClick={() => setSessionMenuOpen((open) => !open)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-lg bg-white/10 p-2 text-white/70 group-hover:block hover:bg-white/15 hover:text-white"
            >
              <MoreVertical size={18} />
            </button>
            {sessionMenuOpen && (
              <div className="absolute right-2 top-[calc(100%-4px)] z-20 min-w-[150px] rounded-xl border border-white/15 bg-[#242424] p-1 shadow-2xl">
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
