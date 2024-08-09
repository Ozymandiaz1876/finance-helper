import { defineConfig } from 'drizzle-kit';

import { config } from 'dotenv';

config({
  path: './.env',
});

const POSTGRES_HOST = process.env.POSTGRES_HOST as string;
const POSTGRES_PORT = process.env.POSTGRES_PORT as string;
const POSTGRES_USER = process.env.POSTGRES_USER as string;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;
const POSTGRES_DB = process.env.POSTGRES_DB as string;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // url: process.env.DATABASE_URL,
    host: POSTGRES_HOST,
    port: +POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
