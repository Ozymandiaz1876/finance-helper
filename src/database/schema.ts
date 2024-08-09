import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email'),
  password: varchar('password'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
