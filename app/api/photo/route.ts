import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
