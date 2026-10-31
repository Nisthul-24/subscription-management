import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET() {
  const user = await getAuthFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
