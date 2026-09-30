export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
