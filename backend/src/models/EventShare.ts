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

@Entity("event_shares")
@Index(["eventId"])
@Index(["userId"])
@Index(["platform"])
export class EventShare {
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

  @Column("varchar", { length: 50 })
  platform!: string; // facebook, twitter, whatsapp, instagram, email

  @Column("varchar", { length: 255, unique: true })
  shareLink!: string;

  @CreateDateColumn()
  sharedAt!: Date;
}
