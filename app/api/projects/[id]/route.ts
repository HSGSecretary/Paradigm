import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
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
    location_name, address, project_status, project_phase_dates,
    invoice_status, invoice_phase_dates, invoice_number, notes,
    order_description, hsg_reference, is_complete, photos,
  } = body;

  const rows = await sql`
    UPDATE projects SET
      location_name        = COALESCE(${location_name ?? null}, location_name),
      address              = COALESCE(${address ?? null}, address),
      project_status       = COALESCE(${project_status ?? null}, project_status),
      project_phase_dates  = COALESCE(${project_phase_dates ?? null}, project_phase_dates),
      invoice_status       = COALESCE(${invoice_status ?? null}, invoice_status),
      invoice_phase_dates  = COALESCE(${invoice_phase_dates ?? null}, invoice_phase_dates),
      invoice_number       = COALESCE(${invoice_number ?? null}, invoice_number),
      notes                = COALESCE(${notes ?? null}, notes),
      order_description    = COALESCE(${order_description ?? null}, order_description),
      hsg_reference        = COALESCE(${hsg_reference ?? null}, hsg_reference),
      is_complete          = COALESCE(${is_complete ?? null}, is_complete),
      photos               = COALESCE(${photos ?? null}, photos),
      updated_at           = NOW()
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
