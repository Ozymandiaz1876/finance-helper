import { User } from './model';
import { IUserRepository } from './interface';

export class UserRepository implements IUserRepository {
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return User.create(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return User.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return User.findByEmail(email);
  }

  async updateUser(id: string, updatedFields: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    return User.update(id, updatedFields);
  }

  async deleteUser(id: string): Promise<boolean> {
    return User.delete(id);
  }
}
