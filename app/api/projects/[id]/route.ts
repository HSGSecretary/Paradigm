import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    location_name,
    address,
    project_status,
    project_status_date,
    invoice_status,
    invoice_status_date,
    invoice_number,
    notes,
    order_description,
    hsg_reference,
    is_complete,
    photos,
  } = body;

  const { rows } = await sql`
    UPDATE projects SET
      location_name       = COALESCE(${location_name ?? null}, location_name),
      address             = COALESCE(${address ?? null}, address),
      project_status      = COALESCE(${project_status ?? null}, project_status),
      project_status_date = ${project_status_date ?? null},
      invoice_status      = COALESCE(${invoice_status ?? null}, invoice_status),
      invoice_status_date = ${invoice_status_date ?? null},
      invoice_number      = ${invoice_number ?? null},
      notes               = ${notes ?? null},
      order_description   = ${order_description ?? null},
      hsg_reference       = ${hsg_reference ?? null},
      is_complete         = COALESCE(${is_complete ?? null}, is_complete),
      photos              = ${photos ?? null},
      updated_at          = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await sql`DELETE FROM projects WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
