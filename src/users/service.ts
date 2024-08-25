import { IUserRepository } from './interface';
import { User } from './model';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async registerUser(email: string, password: string): Promise<User> {
    const newUser = await this.userRepository.createUser({ email, password });
    return newUser;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.getUserByEmail(email);
  }

  async updateUserEmail(id: string, newEmail: string): Promise<User | null> {
    return await this.userRepository.updateUser(id, { email: newEmail });
  }

  async getUserById(ids: string): Promise<User | null> {
    return await this.userRepository.getUserById(ids);
  }
}
