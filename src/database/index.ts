import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } from '@config';
import * as schema from './schema';

const client = new Client({
  host: POSTGRES_HOST,
  port: +POSTGRES_PORT,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});
client.connect();
const db = drizzle(client, { schema });
export default db;
