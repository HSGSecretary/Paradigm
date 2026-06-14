import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
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
      project_status_date TEXT,
      invoice_status TEXT NOT NULL DEFAULT 'No Invoice Issued',
      invoice_status_date TEXT,
      invoice_number TEXT,
      notes TEXT,
      order_description TEXT,
      hsg_reference TEXT,
      is_complete BOOLEAN NOT NULL DEFAULT FALSE,
      photos TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Safe to run on existing tables
  const cols: [string, string][] = [
    ['invoice_number', 'TEXT'],
    ['order_description', 'TEXT'],
    ['hsg_reference', 'TEXT'],
    ['is_complete', 'BOOLEAN NOT NULL DEFAULT FALSE'],
    ['photos', 'TEXT'],
  ];
  for (const [col, type] of cols) {
    try {
      await sql.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    } catch (_) {}
  }

  return NextResponse.json({ ok: true, message: 'Database ready.' });
}
