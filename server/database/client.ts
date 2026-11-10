import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../config/env.js';

// Initialize the Neon HTTP client with the pooled connection string
const sql = neon(env.DATABASE_URL);

// Export the Drizzle ORM instance
export const db = drizzle({ client: sql });