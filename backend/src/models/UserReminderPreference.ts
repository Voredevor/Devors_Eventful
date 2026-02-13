import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { Event } from "./Event";

@Entity("user_reminder_preferences")
@Unique(["userId", "eventId"])
@Index(["userId"])
@Index(["eventId"])
export class UserReminderPreference {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  eventId!: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column("integer")
  reminderDaysBefore!: number;

  @Column("time")
  reminderTime!: string; // HH:mm format

  @Column("boolean", { default: true })
  enabled: boolean = true;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
