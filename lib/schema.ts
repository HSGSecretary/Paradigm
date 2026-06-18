import sql from './db';

// Idempotently ensures columns added after the original schema exist.
// Memoized per serverless instance, so it runs at most once per cold start
// but is safe to await on every request. This removes the dependency on
// manually hitting /api/migrate after a deploy.
let ensured: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS comments TEXT`;
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_notify BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS viewer_notify BOOLEAN NOT NULL DEFAULT FALSE`;
    })().catch((e) => {
      ensured = null; // allow a retry on the next request if it failed
      throw e;
    });
  }
  return ensured;
}
