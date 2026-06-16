import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getSession } from '@/lib/auth';

// Photos live in a PUBLIC blob store, so they are displayed via their direct
// URL (no proxy needed). This route only handles deleting the underlying blob
// when an admin removes a photo, so storage doesn't fill up with orphans.
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try {
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 500 });
  }
}
