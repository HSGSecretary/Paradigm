import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      location_name TEXT NOT NULL,
      address TEXT NOT NULL,
      project_status TEXT NOT NULL DEFAULT 'Pending',
      project_phase_dates TEXT,
      invoice_status TEXT NOT NULL DEFAULT 'No Invoice Issued',
      invoice_phase_dates TEXT,
      invoice_number TEXT,
      notes TEXT,
      order_description TEXT,
      hsg_reference TEXT,
      is_complete BOOLEAN NOT NULL DEFAULT FALSE,
      photos TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_phase_dates TEXT`; } catch (_) {}
  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS invoice_phase_dates TEXT`; } catch (_) {}
  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS invoice_number TEXT`; } catch (_) {}
  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_description TEXT`; } catch (_) {}
  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hsg_reference TEXT`; } catch (_) {}
  try { await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS photos TEXT`; } catch (_) {}

  return NextResponse.json({ ok: true, message: 'Database ready.' });
}
