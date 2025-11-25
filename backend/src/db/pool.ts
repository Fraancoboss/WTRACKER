import 'dotenv/config';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment');
}

const useSSL = process.env.DB_SSL === 'true';

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
