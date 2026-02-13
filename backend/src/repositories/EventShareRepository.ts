import { Repository, DataSource } from "typeorm";
import { EventShare } from "../models/EventShare";

export class EventShareRepository {
  private repository: Repository<EventShare>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(EventShare);
  }

  async create(shareData: Partial<EventShare>): Promise<EventShare> {
    const share = this.repository.create(shareData);
    return this.repository.save(share);
  }

  async findById(id: string): Promise<EventShare | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["event", "user"],
    });
  }

  async findByShareLink(shareLink: string): Promise<EventShare | null> {
    return this.repository.findOne({
      where: { shareLink },
      relations: ["event", "user"],
    });
  }

  async findByEventId(eventId: string): Promise<EventShare[]> {
    return this.repository.find({
      where: { eventId },
      relations: ["user"],
      order: { sharedAt: "DESC" },
    });
  }

  async getShareStats(
    eventId: string
  ): Promise<{
    totalShares: number;
    sharesByPlatform: { [key: string]: number };
    uniqueSharers: number;
  }> {
    const shares = await this.repository.find({
      where: { eventId },
    });

    const sharesByPlatform: { [key: string]: number } = {};
    const uniqueSharers = new Set<string>();

    shares.forEach((share) => {
      if (!sharesByPlatform[share.platform]) {
        sharesByPlatform[share.platform] = 0;
      }
      sharesByPlatform[share.platform]++;
      uniqueSharers.add(share.userId);
    });

    return {
      totalShares: shares.length,
      sharesByPlatform,
      uniqueSharers: uniqueSharers.size,
    };
  }

  async getSharesByPlatform(
    eventId: string,
    platform: string
  ): Promise<EventShare[]> {
    return this.repository.find({
      where: { eventId, platform },
      relations: ["user"],
      order: { sharedAt: "DESC" },
    });
  }

  async getCreatorShareStats(
    creatorId: string
  ): Promise<{
    totalSharesCreated: number;
    sharesByPlatform: { [key: string]: number };
    eventsShared: number;
  }> {
    const query = this.repository
      .createQueryBuilder("share")
      .leftJoinAndSelect("share.event", "event")
      .where("event.creatorId = :creatorId", { creatorId });

    const shares = await query.getMany();

    const sharesByPlatform: { [key: string]: number } = {};
    const uniqueEvents = new Set<string>();

    shares.forEach((share) => {
      if (!sharesByPlatform[share.platform]) {
        sharesByPlatform[share.platform] = 0;
      }
      sharesByPlatform[share.platform]++;
      uniqueEvents.add(share.eventId);
    });

    return {
      totalSharesCreated: shares.length,
      sharesByPlatform,
      eventsShared: uniqueEvents.size,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
