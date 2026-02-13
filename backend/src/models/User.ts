import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity("users")
@Index(["email"], { unique: true })
@Index(["userType"])
export class User {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("varchar", { length: 255, unique: true })
  email!: string;

  @Column("varchar", { length: 255 })
  firstName!: string;

  @Column("varchar", { length: 255 })
  lastName!: string;

  @Column("varchar", { length: 20, nullable: true })
  phone?: string;

  @Column("text", { nullable: true })
  passwordHash!: string;

  @Column("varchar", { length: 255, nullable: true })
  profilePictureUrl?: string;

  @Column("enum", { enum: ["creator", "eventee"], default: "eventee" })
  userType!: "creator" | "eventee";

  @Column("boolean", { default: false })
  verified!: boolean;

  @Column("varchar", { length: 255, nullable: true })
  verificationToken?: string;

  @Column("timestamp", { nullable: true })
  verificationTokenExpiresAt?: Date;

  @Column("varchar", { length: 500, nullable: true })
  refreshToken?: string;

  @Column("timestamp", { nullable: true })
  refreshTokenExpiresAt?: Date;

  @Column("timestamp", { nullable: true })
  lastLoginAt?: Date;

  @Column("varchar", { length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column("timestamp", { nullable: true })
  resetPasswordTokenExpiresAt?: Date;

  @Column("boolean", { default: false })
  isActive: boolean = true;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
