import { Repository } from "typeorm";
import { Notification } from "@models/Notification";
import { appDataSource } from "@config/database";

export class NotificationRepository {
  private repository: Repository<Notification>;

  constructor() {
    this.repository = appDataSource.getRepository(Notification);
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repository.create(data);
    return this.repository.save(notification);
  }

  async findById(notificationId: string): Promise<Notification | null> {
    return this.repository.findOne({
      where: { id: notificationId },
    });
  }

  async findByUserId(userId: string, page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { notifications, total };
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { userId, read: false },
      order: { createdAt: "DESC" },
    });
  }

  async findPendingNotifications(): Promise<Notification[]> {
    return this.repository
      .createQueryBuilder("notification")
      .where("notification.scheduledDate <= NOW()", {})
      .andWhere("notification.sentDate IS NULL")
      .orderBy("notification.scheduledDate", "ASC")
      .getMany();
  }

  async findByEventId(eventId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { eventId },
      order: { createdAt: "DESC" },
    });
  }

  async update(notificationId: string, data: Partial<Notification>): Promise<Notification> {
    await this.repository.update(notificationId, data);
    const notification = await this.findById(notificationId);
    if (!notification) throw new Error("Notification not found after update");
    return notification;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.update(notificationId, { read: true });
  }

  async markAsSent(notificationId: string): Promise<Notification> {
    return this.update(notificationId, { sentDate: new Date() });
  }

  async markUserNotificationsAsRead(userId: string): Promise<void> {
    await this.repository.update({ userId, read: false }, { read: true });
  }

  async delete(notificationId: string): Promise<void> {
    await this.repository.delete(notificationId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId, read: false },
    });
  }
}

export const notificationRepository = new NotificationRepository();
