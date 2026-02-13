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

@Entity("tickets")
@Index(["eventId"])
@Index(["userId"])
@Index(["status"])
export class Ticket {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("uuid")
  eventId!: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("text")
  qrCodeData!: string;

  @Column("text")
  qrCodeImageUrl!: string;

  @Column("boolean", { default: false })
  qrScanned: boolean = false;

  @Column("timestamp", { nullable: true })
  qrScannedAt?: Date;

  @Column("timestamp")
  purchaseDate: Date = new Date();

  @Column("enum", { enum: ["active", "used", "refunded"], default: "active" })
  status: "active" | "used" | "refunded" = "active";

  @CreateDateColumn()
  createdAt!: Date;
}
