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
import { Ticket } from "./Ticket";

@Entity("payments")
@Index(["userId"])
@Index(["eventId"])
@Index(["status"])
export class Payment {
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

  @Column("uuid")
  ticketId!: string;

  @ManyToOne(() => Ticket, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ticketId" })
  ticket!: Ticket;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column("varchar", { length: 10, default: "NGN" })
  currency: string = "NGN";

  @Column("varchar", { length: 255 })
  paymentReference!: string;

  @Column("enum", {
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  })
  status: "pending" | "completed" | "failed" | "refunded" = "pending";

  @Column("varchar", { length: 50, default: "paystack" })
  paymentMethod: string = "paystack";

  @Column("timestamp", { nullable: true })
  paymentDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
