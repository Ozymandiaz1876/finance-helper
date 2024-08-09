import { hash } from 'bcrypt';
import { Service } from 'typedi';
import db from '@database';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const currentUsers = await db.select().from(users);

    return currentUsers;
  }

  public async findUserById(userId: number): Promise<User> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!user) throw new HttpException(409, "User doesn't exist");

    return user;
  }

  public async createUser(userData: User): Promise<User> {
    const { email, password } = userData;

    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (currentUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(password, 10);

    const createdUser = await db.insert(users).values({ email: email, password: hashedPassword }).returning();

    return createdUser[0];
  }

  public async updateUser(userId: number, userData: User): Promise<User[]> {
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!currentUser) throw new HttpException(409, "User doesn't exist");

    const { email, password } = userData;
    const hashedPassword = await hash(password, 10);
    const updatedUser = await db.update(users).set({ email: email, password: hashedPassword }).where(eq(users.id, userId)).returning();

    return updatedUser;
  }

  public async deleteUser(userId: number): Promise<User[]> {
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!currentUser) throw new HttpException(409, "User doesn't exist");

    const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();

    return deletedUser;
  }
}
