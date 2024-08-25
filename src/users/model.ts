import db from '@database';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { HttpException } from '@/exceptions/httpException';
import { hash } from 'bcrypt';

export class User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & Partial<User>) {
    this.id = user.id ?? '';
    this.email = user.email;
    this.password = user.password;
    this.createdAt = user.createdAt ?? new Date();
    this.updatedAt = user.updatedAt ?? new Date();
  }

  static async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { email, password } = user;

    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (currentUser) throw new HttpException(409, `This email ${email} already exists`);

    const hashedPassword = await hash(password, 10);

    const [newUser] = await db.insert(users).values({ email: email, password: hashedPassword }).returning();
    return new User(newUser);
  }

  static async findById(id: string): Promise<User | null> {
    const user = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, id) });
    if (!user) throw new HttpException(409, "User doesn't exist");
    return user ? new User(user) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.email, email) });
    return user ? new User(user) : null;
  }

  static async update(id: string, updatedFields: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!currentUser) throw new HttpException(409, "User doesn't exist");

    const { email, password } = updatedFields;
    const hashedPassword = await hash(password, 10);
    const [updatedUser] = await db.update(users).set({ email: email, password: hashedPassword }).where(eq(users.id, id)).returning();

    return updatedUser ? new User(updatedUser) : null;
  }

  static async delete(id: string): Promise<boolean> {
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!currentUser) throw new HttpException(409, "User doesn't exist");

    const deletedUsers = await db.delete(users).where(eq(users.id, id)).returning();

    return deletedUsers.length > 0;
  }
}
