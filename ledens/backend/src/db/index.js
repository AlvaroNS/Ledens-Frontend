import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
// Arbitrary constant so concurrent replicas don't run migrations at the same time.
const MIGRATION_LOCK_ID = 461728;

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000, // fail fast instead of hanging /api/health
    })
  : null;

pool?.on('error', (err) => console.error('[db] idle client error', err));

let migrated = false;

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version    text        PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    const { rows } = await client.query('SELECT version FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.version));
    const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[db] applied migration ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]).catch(() => {});
    client.release();
  }
}

// Runs migrations in the background, retrying with backoff until they succeed,
// so a database that is briefly unreachable at startup doesn't leave the
// schema missing for the lifetime of the revision.
export function startMigrations() {
  if (!pool) {
    console.warn('[db] DATABASE_URL not set — database features disabled');
    return;
  }

  let delayMs = 5000;
  const attempt = async () => {
    try {
      await migrate();
      migrated = true;
      console.log('[db] schema up to date');
    } catch (err) {
      console.error(`[db] migration failed, retrying in ${delayMs / 1000} s`, err);
      setTimeout(attempt, delayMs);
      delayMs = Math.min(delayMs * 2, 5 * 60 * 1000);
    }
  };
  attempt();
}

export async function dbStatus() {
  if (!pool) return 'disabled';
  if (!migrated) return 'migrating';
  try {
    await pool.query('SELECT 1');
    return 'ok';
  } catch {
    return 'error';
  }
}
