import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load .env.local for migration commands (dev only)
config({ path: resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL_UNPOOLED;

if (!dbUrl) {
  throw new Error('DATABASE_URL_UNPOOLED is not set in .env.local');
}

export default defineConfig({
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: false,
});