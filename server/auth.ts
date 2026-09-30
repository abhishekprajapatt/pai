import jwt from 'jsonwebtoken';

/**
 * Verify Firebase ID token from Authorization header
 * Extracts the user ID from the token's 'sub' claim
 * @param token - Firebase ID token (without 'Bearer ' prefix)
 * @returns The Firebase UID (user ID) or null if verification fails
 */
export async function verifyFirebaseToken(
  token: string,
): Promise<string | null> {
  try {
    if (!token || token.trim() === '') {
      return null;
    }

    const decoded = jwt.decode(token) as any;

    if (!decoded) {
      return null;
    }

    const uid = decoded?.sub || decoded?.uid;

    if (!uid) {
      return null;
    }
    return uid;
  } catch (error) {
    console.error('[Token] Verification failed:', error);
    return null;
  }
}

/**
 * Extract Firebase ID token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns The token without 'Bearer ' prefix, or null if not present
 */
export function extractTokenFromHeader(
  authHeader: string | null,
): string | null {
  if (!authHeader) {
    return null;
  }
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match) {
    return null;
  }
  return match ? match[1] : null;
}

/**
 * Get user ID from request Authorization header
 * @param req - NextRequest object
 * @returns The Firebase UID or null if not authenticated
 */
export async function getUserIdFromRequest(req: {
  headers: { get: (key: string) => string | null };
}): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');

  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyFirebaseToken(token);
}
