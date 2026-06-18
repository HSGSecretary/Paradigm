import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sql from '@/lib/db';
import { ensureSchema } from '@/lib/schema';
import { getSession } from '@/lib/auth';
import type { ProjectComment } from '@/lib/constants';

async function loadComments(id: string): Promise<ProjectComment[] | null> {
  const rows = await sql`SELECT comments FROM projects WHERE id = ${id}`;
  if (rows.length === 0) return null;
  return rows[0].comments ? JSON.parse(rows[0].comments) : [];
}

async function saveComments(id: string, comments: ProjectComment[]) {
  const rows = await sql`
    UPDATE projects SET comments = ${JSON.stringify(comments)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

// Add a comment (admin or viewer). Raises the OTHER side's notification.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSchema();

  const { text } = await req.json();
  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }

  const existing = await loadComments(params.id);
  if (existing === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const comment: ProjectComment = {
    id: randomUUID(),
    role: session.role,
    text: text.trim(),
    created_at: new Date().toISOString(),
  };
  const updated = JSON.stringify([...existing, comment]);

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

// Edit a comment. A role may only edit its own comments.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSchema();

  const { commentId, text } = await req.json();
  if (!commentId || !text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Invalid edit' }, { status: 400 });
  }

  const existing = await loadComments(params.id);
  if (existing === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const idx = existing.findIndex(c => c.id === commentId);
  if (idx === -1) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (existing[idx].role !== session.role) {
    return NextResponse.json({ error: 'You can only edit your own comments' }, { status: 403 });
  }

  existing[idx] = { ...existing[idx], text: text.trim(), edited_at: new Date().toISOString() };
  return NextResponse.json(await saveComments(params.id, existing));
}

// Delete a comment via ?commentId=. A role may only delete its own comments.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSchema();

  const commentId = req.nextUrl.searchParams.get('commentId');
  if (!commentId) return NextResponse.json({ error: 'No comment id' }, { status: 400 });

  const existing = await loadComments(params.id);
  if (existing === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const target = existing.find(c => c.id === commentId);
  if (!target) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  if (target.role !== session.role) {
    return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
  }

  const updated = existing.filter(c => c.id !== commentId);
  return NextResponse.json(await saveComments(params.id, updated));
}
