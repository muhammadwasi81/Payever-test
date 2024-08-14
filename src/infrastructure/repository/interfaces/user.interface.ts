import { User } from 'src/domain/user/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  updateAvatar(userId: string, hash: string, base64: string): Promise<User>;
  updateAvatarHash(userId: string, hash: string): Promise<User>;
  findByExternalId(externalId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
