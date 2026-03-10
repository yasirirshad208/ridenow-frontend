import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone: string;
  avatar?: string;
};

export type SessionData = {
  success: boolean;
  token: string;
  data: {
    user: SessionUser;
  };
};

export async function getSessionFromCookies(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session?.value) return null;

  try {
    return JSON.parse(session.value) as SessionData;
  } catch {
    return null;
  }
}

export async function requireSession(redirectTo = '/login') {
  const session = await getSessionFromCookies();
  if (!session?.token) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireAdminSession(redirectTo = '/login') {
  const session = await requireSession(redirectTo);
  if (session.data.user.role !== 'admin') {
    redirect(redirectTo);
  }
  return session;
}
