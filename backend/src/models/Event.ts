import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";

@Entity("events")
@Index(["creatorId"])
@Index(["status"])
@Index(["startDate"])
export class Event {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("uuid")
  creatorId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "creatorId" })
  creator!: User;

  @Column("varchar", { length: 200 })
  title!: string;

  @Column("text")
  description!: string;

  @Column("varchar", { length: 50 })
  category!: string;

  @Column("varchar", { length: 500, nullable: true })
  imageUrl?: string;

  @Column("varchar", { length: 200 })
  location!: string;

  @Column("timestamp")
  startDate!: Date;

  @Column("timestamp")
  endDate!: Date;

  @Column("integer")
  totalTickets!: number;

  @Column("integer", { default: 0 })
  soldTickets: number = 0;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column("enum", {
    enum: ["draft", "published", "cancelled", "completed"],
    default: "draft",
  })
  status: "draft" | "published" | "cancelled" | "completed" = "draft";

  @Column("varchar", { length: 20, default: "1day" })
  reminderDefault: string = "1day";

  @Column("integer", { nullable: true })
  customReminderHours?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
