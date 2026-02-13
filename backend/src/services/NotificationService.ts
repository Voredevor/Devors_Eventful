import { Resend } from "resend";
import twilio from "twilio";
import config from "@config/environment";
import { notificationRepository } from "@repositories/NotificationRepository";

// Initialize external services
const resend = new Resend(config.email.resendApiKey);
const twilioClient = twilio(config.sms.accountSid, config.sms.authToken);

export interface NotificationPayload {
  userId: string;
  eventId?: string;
  type: string;
  title: string;
  message: string;
  deliveryMethod: "email" | "sms" | "in_app";
  userEmail?: string;
  userPhone?: string;
  scheduledDate?: Date;
}

export class EmailService {
  async send(to: string, subject: string, message: string, htmlContent?: string): Promise<boolean> {
    try {
      await resend.emails.send({
        from: config.email.resendFromEmail,
        to,
        subject,
        html: htmlContent || `<p>${message}</p>`,
      });
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("Resend email error:", error);
      return false;
    }
  }

  async sendEventReminder(to: string, eventTitle: string, eventDate: string): Promise<boolean> {
    const subject = `Reminder: ${eventTitle} is coming up!`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder</h2>
        <p>Hi,</p>
        <p>This is a reminder that <strong>${eventTitle}</strong> is happening on <strong>${eventDate}</strong>.</p>
        <p>Don't miss out! See you there.</p>
        <p>Best regards,<br>The Eventful Team</p>
      </div>
    `;
    return this.send(to, subject, `Reminder: ${eventTitle}`, htmlContent);
  }

  async sendTicketConfirmation(to: string, eventTitle: string, ticketId: string): Promise<boolean> {
    const subject = `Your Ticket for ${eventTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Ticket Confirmation</h2>
        <p>Hi,</p>
        <p>Your ticket for <strong>${eventTitle}</strong> has been confirmed!</p>
        <p>Ticket ID: <code>${ticketId}</code></p>
        <p>You will receive your QR code shortly. Show it at the event entrance.</p>
        <p>Best regards,<br>The Eventful Team</p>
      </div>
    `;
    return this.send(to, subject, `Ticket confirmed: ${eventTitle}`, htmlContent);
  }
}

export class SMSService {
  async send(to: string, message: string): Promise<boolean> {
    try {
      await twilioClient.messages.create({
        body: message,
        from: config.sms.phoneNumber,
        to,
      });
      return true;
    } catch (error) {
      console.error("Twilio SMS error:", error);
      return false;
    }
  }

  async sendEventReminder(phone: string, eventTitle: string): Promise<boolean> {
    const message = `Reminder: ${eventTitle} is happening soon! Don't forget to bring your ticket.`;
    return this.send(phone, message);
  }

  async sendTicketConfirmation(phone: string, eventTitle: string): Promise<boolean> {
    const message = `Your ticket for ${eventTitle} has been confirmed! Check your email for the QR code.`;
    return this.send(phone, message);
  }
}

export class NotificationService {
  private emailService = new EmailService();
  private smsService = new SMSService();

  async createNotification(payload: NotificationPayload): Promise<any> {
    const notification = await notificationRepository.create({
      userId: payload.userId,
      eventId: payload.eventId,
      type: payload.type as "reminder" | "update" | "payment_receipt" | "qr_scan" | "event_cancelled",
      title: payload.title,
      message: payload.message,
      deliveryMethod: payload.deliveryMethod,
      scheduledDate: payload.scheduledDate || new Date(),
    });

    // Send immediately if no scheduled date or scheduled date is in past
    if (!payload.scheduledDate || payload.scheduledDate <= new Date()) {
      await this.sendNotification(notification.id, payload);
    }

    return notification;
  }

  async sendNotification(notificationId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      let sent = false;

      if (payload.deliveryMethod === "email" && payload.userEmail) {
        if (payload.type === "event_reminder") {
          sent = await this.emailService.sendEventReminder(
            payload.userEmail,
            `Event: ${payload.title}`,
            payload.message
          );
        } else if (payload.type === "ticket_confirmation") {
          sent = await this.emailService.sendTicketConfirmation(payload.userEmail, payload.title, payload.message);
        } else {
          sent = await this.emailService.send(
            payload.userEmail,
            payload.title,
            payload.message
          );
        }
      } else if (payload.deliveryMethod === "sms" && payload.userPhone) {
        if (payload.type === "event_reminder") {
          sent = await this.smsService.sendEventReminder(payload.userPhone, payload.title);
        } else if (payload.type === "ticket_confirmation") {
          sent = await this.smsService.sendTicketConfirmation(payload.userPhone, payload.title);
        } else {
          sent = await this.smsService.send(payload.userPhone, payload.message);
        }
      } else if (payload.deliveryMethod === "in_app") {
        sent = true; // In-app notifications are stored in DB, already done
      }

      if (sent) {
        await notificationRepository.markAsSent(notificationId);
      }

      return sent;
    } catch (error) {
      console.error("Notification send error:", error);
      return false;
    }
  }

  async sendEventReminder(userId: string, eventId: string, eventTitle: string, userEmail: string, userPhone?: string): Promise<void> {
    // Send in-app notification
    await this.createNotification({
      userId,
      eventId,
      type: "event_reminder",
      title: `Event Reminder: ${eventTitle}`,
      message: `Your event ${eventTitle} is happening soon!`,
      deliveryMethod: "in_app",
      userEmail,
      userPhone,
    });

    // Send email
    await this.createNotification({
      userId,
      eventId,
      type: "event_reminder",
      title: eventTitle,
      message: new Date().toLocaleDateString(),
      deliveryMethod: "email",
      userEmail,
      userPhone,
    });

    // Send SMS if phone available
    if (userPhone) {
      await this.createNotification({
        userId,
        eventId,
        type: "event_reminder",
        title: eventTitle,
        message: "",
        deliveryMethod: "sms",
        userEmail,
        userPhone,
      });
    }
  }

  async getNotifications(userId: string, page = 1, limit = 20): Promise<{ notifications: any[]; total: number; pages: number; unread: number }> {
    const { notifications, total } = await notificationRepository.findByUserId(userId, page, limit);
    const unread = await notificationRepository.countUnread(userId);

    return {
      notifications,
      total,
      pages: Math.ceil(total / limit),
      unread,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<any> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return notificationRepository.markUserNotificationsAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return notificationRepository.delete(notificationId);
  }
}

export const notificationService = new NotificationService();
