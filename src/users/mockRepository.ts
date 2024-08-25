import { IUserRepository } from './interface';
import { User } from './model';

export class MockRepository implements IUserRepository {
  private users: User[] = [
    {
      id: '1',
      email: 'test1@example.com',
      password: 'password123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'test2@example.com',
      password: 'password456',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser = {
      id: (this.users.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async updateUser(id: string, updatedFields: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    const updatedUser = { ...this.users[index], ...updatedFields };
    this.users[index] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
