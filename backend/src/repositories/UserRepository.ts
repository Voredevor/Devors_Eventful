import { AppDataSource } from "../config/database";
import { User } from "../models/User";

export class UserRepository {
  private repository = AppDataSource.getRepository(User);

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { verificationToken: token },
    });
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { refreshToken: token },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { users, total };
  }

  async findByUserType(userType: "creator" | "eventee", page: number = 1, limit: number = 10) {
    const [users, total] = await this.repository.findAndCount({
      where: { userType },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { users, total };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { lastLoginAt: new Date() });
  }

  async verify(id: string): Promise<void> {
    await this.repository.update(id, {
      verified: true,
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined,
    });
  }

  async setRefreshToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await this.repository.update(id, { refreshToken: token, refreshTokenExpiresAt: expiresAt });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.repository.update(id, { refreshToken: undefined, refreshTokenExpiresAt: undefined });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.repository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async setResetToken(id: string, token: string, expiresAt: Date): Promise<void> {
    await this.repository.update(id, { resetPasswordToken: token, resetPasswordTokenExpiresAt: expiresAt });
  }

  async clearResetToken(id: string): Promise<void> {
    await this.repository.update(id, { resetPasswordToken: undefined, resetPasswordTokenExpiresAt: undefined });
  }
}

export const userRepository = new UserRepository();
