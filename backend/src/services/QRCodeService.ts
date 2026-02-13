import QRCode from "qrcode";
import crypto from "crypto";

interface QRCodePayload {
  ticketId: string;
  userId: string;
  eventId: string;
  timestamp: number;
  signature: string;
}

export class QRCodeService {
  private generateSignature(data: Omit<QRCodePayload, "signature">): string {
    const message = `${data.ticketId}-${data.userId}-${data.eventId}-${data.timestamp}`;
    return crypto.createHmac("sha256", process.env.JWT_SECRET || "secret").update(message).digest("hex");
  }

  async generateQRCode(ticketId: string, userId: string, eventId: string): Promise<QRCodePayload> {
    const timestamp = Date.now();
    const signature = this.generateSignature({ ticketId, userId, eventId, timestamp });

    const payload: QRCodePayload = {
      ticketId,
      userId,
      eventId,
      timestamp,
      signature,
    };

    return payload;
  }

  async generateQRCodeImage(payload: QRCodePayload): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 300,
        margin: 1,
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error("Failed to generate QR code image");
    }
  }

  verifyQRCode(payload: QRCodePayload): boolean {
    const { signature, ...dataWithoutSignature } = payload;
    const expectedSignature = this.generateSignature(dataWithoutSignature);
    
    if (signature !== expectedSignature) {
      return false;
    }

    // Check if QR code is not older than 1 hour (optional security check)
    const ageInMinutes = (Date.now() - payload.timestamp) / (1000 * 60);
    if (ageInMinutes > 60) {
      return false;
    }

    return true;
  }

  parseQRCode(qrData: string): QRCodePayload {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      throw new Error("Invalid QR code format");
    }
  }
}

export const qrCodeService = new QRCodeService();
