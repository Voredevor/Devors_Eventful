import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { Event } from "./Event";

@Entity("notifications")
@Index(["userId"])
@Index(["eventId"])
@Index(["read"])
export class Notification {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid", { nullable: true })
  eventId?: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "eventId" })
  event?: Event;

  @Column("enum", {
    enum: ["reminder", "update", "payment_receipt", "qr_scan", "event_cancelled"],
    default: "reminder",
  })
  type: "reminder" | "update" | "payment_receipt" | "qr_scan" | "event_cancelled" =
    "reminder";

  @Column("varchar", { length: 200 })
  title!: string;

  @Column("text")
  message!: string;

  @Column("timestamp", { nullable: true })
  scheduledDate?: Date;

  @Column("timestamp", { nullable: true })
  sentDate?: Date;

  @Column("enum", { enum: ["email", "sms", "in_app"], default: "in_app" })
  deliveryMethod: "email" | "sms" | "in_app" = "in_app";

  @Column("boolean", { default: false })
  read: boolean = false;

  @CreateDateColumn()
  createdAt!: Date;
}
