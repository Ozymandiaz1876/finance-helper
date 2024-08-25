import { User } from './model';

export interface IUserRepository {
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updatedFields: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}
