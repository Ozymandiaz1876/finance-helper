import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET_KEY } from '@config';
import db from '@database';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { users } from '@/database/schema';

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const expiresIn: number = 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@Service()
export class AuthService {
  public async signup(userData: User): Promise<User> {
    const { email, password } = userData;

    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (currentUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(password, 10);

    const createdUser = await db.insert(users).values({ email: email, password: hashedPassword }).returning();

    return createdUser[0];
  }

  public async login(userData: User): Promise<{ cookie: string; findUser: User }> {
    const { email, password } = userData;

    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!currentUser) throw new HttpException(409, `This email ${email} was not found`);

    const isPasswordMatching: boolean = await compare(password, currentUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = createToken(currentUser);
    const cookie = createCookie(tokenData);
    return { cookie, findUser: currentUser };
  }

  public async logout(userData: User): Promise<User> {
    const { email, password } = userData;

    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!currentUser) throw new HttpException(409, "User doesn't exist");

    const isPasswordMatching: boolean = await compare(password, currentUser.password);

    if (!isPasswordMatching) throw new HttpException(409, "You're password's not matching");

    return currentUser;
  }
}
