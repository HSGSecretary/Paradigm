// Run once to create the database table: node lib/migrate.js
// Or call GET /api/migrate after deploying (admin only)

const { sql } = require('@vercel/postgres');

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      location_name TEXT NOT NULL,
      address TEXT NOT NULL,
      project_status TEXT NOT NULL DEFAULT 'Pending',
      project_status_date TEXT,
      invoice_status TEXT NOT NULL DEFAULT 'No Invoice Issued',
      invoice_status_date TEXT,
      notes TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      po_number TEXT,
      sign_type TEXT,
      permit_info TEXT,
      deposit_amount TEXT,
      final_amount TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
