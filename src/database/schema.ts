import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  email: varchar('email'),
  password: varchar('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orgs = pgTable('orgs', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: varchar('name'),
  market_name: varchar('market_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const financial_data = pgTable('financial_data', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  org_id: uuid('org_id').references(() => orgs.id),
  scrapped_data: varchar('scrapped_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orgs_financial_data = pgTable('orgs_financial_data', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  org_id: uuid('org_id').references(() => orgs.id),
  financial_data_id: uuid('financial_data_id').references(() => financial_data.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
