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

@Entity("analytics")
@Index(["eventId"])
@Index(["creatorId"])
@Index(["dateTracked"])
export class Analytics {
  @PrimaryColumn("uuid")
  id: string = uuidv4();

  @Column("uuid")
  eventId!: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column("uuid")
  creatorId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "creatorId" })
  creator!: User;

  @Column("integer", { default: 0 })
  totalAttendees: number = 0;

  @Column("integer", { default: 0 })
  totalTicketsSold: number = 0;

  @Column("integer", { default: 0 })
  ticketHoldersWithScannedQr: number = 0;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  revenue: number = 0;

  @Column("date")
  dateTracked!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
