import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { location_name, address, notes } = body;

  const rows = await sql`
    INSERT INTO projects (location_name, address, notes, viewer_notify)
    VALUES (${location_name}, ${address}, ${notes}, TRUE)
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
