import { z } from 'zod';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load .env.local for local development (safely skipped in production if file is missing)
config({ path: resolve(process.cwd(), '.env.local') });

const booleanish = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // ... (leave the rest of the schema exactly as it was)
  DATABASE_URL_UNPOOLED: z.string().min(1, 'DATABASE_URL_UNPOOLED is required'),

  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be 32+ chars'),
  BETTER_AUTH_URL: z.string().url(),

  EMAIL_MODE: z.enum(['preview', 'resend']).default('preview'),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),

  PAYMENT_MODE: z.enum(['simulated', 'stripe_test']).default('simulated'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  ENABLE_ABLY: booleanish,
  ABLY_API_KEY: z.string().optional(),

  ENABLE_CLOUDINARY: booleanish,
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  VITE_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  // Use console.error, not a logger — logger depends on env.
  console.error(`\n[env] Invalid environment configuration:\n${issues}\n`);
  throw new Error('Environment validation failed. See messages above.');
}

export const env = parsed.data;
export type Env = typeof env;
