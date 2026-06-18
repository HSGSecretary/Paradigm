import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

// Add a comment to a project. Available to BOTH admin and viewer — this is the
// viewer's only write capability. Posting raises the OTHER side's notification.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }

  const existingRows = await sql`SELECT comments FROM projects WHERE id = ${params.id}`;
  if (existingRows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = existingRows[0].comments ? JSON.parse(existingRows[0].comments) : [];
  const comment = {
    id: randomUUID(),
    role: session.role,
    text: text.trim(),
    created_at: new Date().toISOString(),
  };
  const updated = JSON.stringify([...existing, comment]);

  // A viewer comment notifies the admin; an admin comment notifies the viewer.
  const notifyAdmin = session.role === 'viewer';
  const notifyViewer = session.role === 'admin';

  const rows = await sql`
    UPDATE projects SET
      comments      = ${updated},
      admin_notify  = CASE WHEN ${notifyAdmin}  THEN TRUE ELSE admin_notify  END,
      viewer_notify = CASE WHEN ${notifyViewer} THEN TRUE ELSE viewer_notify END,
      updated_at    = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}
