import { NextRequest, NextResponse } from 'next/server';
import { createSession, clearSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_PASSWORD) {
    await createSession('admin');
    return NextResponse.json({ role: 'admin' });
  }

  if (password === process.env.VIEWER_PASSWORD) {
    await createSession('viewer');
    return NextResponse.json({ role: 'viewer' });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
