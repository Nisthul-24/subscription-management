import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';
import type { Role } from './types';

const SALT_ROUNDS = 12;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-jwt-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret');
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// ─── PASSWORD ───────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Password must be ≥9 characters with at least:
 * - one uppercase letter
 * - one lowercase letter
 * - one special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 9) {
    return { valid: false, message: 'Password must be at least 9 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
}

// ─── JWT ────────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export async function createAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as { userId: string };
  } catch {
    return null;
  }
}

// ─── COOKIE HELPERS ─────────────────────────────────────────────────────────────

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

export async function getAuthFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  // Try refresh token
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) return null;

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload) return null;

  // Fetch user and issue new tokens
  const user = await prisma.user.findUnique({ where: { id: refreshPayload.userId } });
  if (!user) return null;

  const jwtPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const newAccessToken = await createAccessToken(jwtPayload);
  const newRefreshToken = await createRefreshToken({ userId: user.id });
  await setAuthCookies(newAccessToken, newRefreshToken);

  return jwtPayload;
}

// ─── API ROUTE GUARD ────────────────────────────────────────────────────────────

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>>; user: JWTPayload }
) => Promise<NextResponse>;

/**
 * Server-side role guard for API routes.
 * Usage: export const GET = withAuth(['ADMIN', 'STAFF'], handler);
 */
export function withAuth(
  allowedRoles: Role[],
  handler: AuthenticatedHandler
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getAuthFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, { ...context, user });
  };
}

async function getAuthFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const accessToken = req.cookies.get('accessToken')?.value;
  
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;

  const refreshPayload = await verifyRefreshToken(refreshToken);
  if (!refreshPayload) return null;

  const user = await prisma.user.findUnique({ where: { id: refreshPayload.userId } });
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
