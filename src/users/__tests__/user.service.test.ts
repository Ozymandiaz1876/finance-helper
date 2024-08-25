import { UserService } from '../service';
import { MockRepository } from '../mockRepository';

describe('UserService', () => {
  it('should have a method to find all users', async () => {
    const mockRepository = new MockRepository();
    const userService = new UserService(mockRepository);
    const users = await userService.findAllUser();
    expect(users).toEqual(expect.arrayContaining([expect.objectContaining({ id: expect.any(Number) })]));
  });

  it('should have a method to find a user by id', async () => {
    const userService = new UserService();
    const user = await userService.findUserById('1');
    expect(user).toEqual(expect.objectContaining({ id: 1 }));
  });

  it('should have a method to create a user', async () => {
    const userService = new UserService();
    const user = await userService.createUser({ email: 'user@example.com', password: 'password' });
    expect(user).toEqual(expect.objectContaining({ id: expect.any(Number) }));
  });

  it('should have a method to update a user', async () => {
    const userService = new UserService();
    const user = await userService.updateUser('1', { email: 'user@example.com', password: 'password' });
    expect(user).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });

  it('should have a method to delete a user', async () => {
    const userService = new UserService();
    const user = await userService.deleteUser('1');
    expect(user).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });
});
