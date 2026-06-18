import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { ensureSchema } from '@/lib/schema';
import { getSession } from '@/lib/auth';

// Dismiss the notification for the CURRENT role only. An admin dismissing does
// not clear the viewer's badge, and vice-versa. Dismissing is not itself a
// "change", so it never raises the other side's notification.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureSchema();

  const clearAdmin = session.role === 'admin';
  const clearViewer = session.role === 'viewer';

  const rows = await sql`
    UPDATE projects SET
      admin_notify  = CASE WHEN ${clearAdmin}  THEN FALSE ELSE admin_notify  END,
      viewer_notify = CASE WHEN ${clearViewer} THEN FALSE ELSE viewer_notify END
    WHERE id = ${params.id}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
