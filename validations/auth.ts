import { isEmailAddress, normalizeEmailAddress } from '@/email/normalize';

export interface SyncUserPayload {
  uid: string;
  email: string;
  name: string;
  image?: string;
  authProvider: string;
}

export function parseSyncUserPayload(input: unknown): SyncUserPayload | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const payload = input as Partial<SyncUserPayload>;
  const uid = typeof payload.uid === 'string' ? payload.uid.trim() : '';
  const email =
    typeof payload.email === 'string'
      ? normalizeEmailAddress(payload.email)
      : '';
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const authProvider =
    typeof payload.authProvider === 'string' ? payload.authProvider.trim() : '';

  if (!uid || !email || !isEmailAddress(email) || !authProvider) {
    return null;
  }

  return {
    uid,
    email,
    name,
    image: typeof payload.image === 'string' ? payload.image.trim() : undefined,
    authProvider,
  };
}
