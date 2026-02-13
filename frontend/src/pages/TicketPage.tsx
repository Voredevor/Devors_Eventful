import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "@services/ticketService";
import { Ticket } from "@/types";
import { useAuth } from "@hooks/useAuth";
import { useTicket } from "@hooks/useTicket";
import toast from "react-hot-toast";
import { FiArrowLeft, FiDownload, FiTrash2 } from "react-icons/fi";

export default function TicketPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refundTicket, loading: refunding } = useTicket();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTicketById(ticketId!);
      setTicket(data);

      // Verify ownership
      if (user && data.userId !== user.id) {
        toast.error("Unauthorized access to this ticket");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to load ticket");
      navigate("/my-tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!ticketId) return;
    const confirmed = window.confirm(
      "Are you sure you want to refund this ticket? This action cannot be undone."
    );
    if (confirmed) {
      const result = await refundTicket(ticketId);
      if (result) {
        navigate("/my-tickets");
      }
    }
  };

  const handleDownloadQR = () => {
    if (!ticket?.qrCodeImageUrl) return;
    const link = document.createElement("a");
    link.href = ticket.qrCodeImageUrl;
    link.download = `ticket-${ticket.id}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Ticket not found</p>
          <button onClick={() => navigate("/my-tickets")} className="btn-primary">
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  const isRefundable = ticket.status === "active" && !ticket.qrScanned;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => navigate("/my-tickets")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FiArrowLeft /> Back to My Tickets
        </button>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
          {/* Ticket Header */}
          <div className="border-b border-gray-700 pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{ticket.event?.title}</h1>
            <p className="text-gray-400">
              Ticket ID: <span className="font-mono text-blue-400">{ticket.id}</span>
            </p>
          </div>

          {/* Ticket Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className="text-xl font-bold text-white capitalize">{ticket.status}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Purchase Date</p>
              <p className="text-lg font-semibold text-white">
                {new Date(ticket.purchaseDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          {ticket.qrCodeImageUrl && (
            <div className="bg-gray-700 rounded-lg p-8 flex flex-col items-center">
              <p className="text-gray-400 text-sm mb-4">Your QR Code</p>
              <img
                src={ticket.qrCodeImageUrl}
                alt="QR Code"
                className="w-64 h-64 bg-white p-4 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-4 text-center">
                Show this QR code at the event entrance for verification
              </p>
            </div>
          )}

          {/* Scanned Status */}
          {ticket.qrScanned && (
            <div className="bg-green-900 border border-green-600 rounded-lg p-4">
              <p className="text-green-300 font-semibold">✓ Ticket scanned at event</p>
              {ticket.qrScannedAt && (
                <p className="text-green-200 text-sm mt-1">
                  Scanned on {new Date(ticket.qrScannedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Event Details */}
          {ticket.event && (
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">Event Details</h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <span className="text-gray-400">Location:</span> {ticket.event.location}
                </p>
                <p>
                  <span className="text-gray-400">Date:</span>{" "}
                  {new Date(ticket.event.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="text-gray-400">Time:</span>{" "}
                  {new Date(ticket.event.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <FiDownload /> Download QR Code
            </button>
            {isRefundable && (
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <FiTrash2 /> {refunding ? "Processing..." : "Request Refund"}
              </button>
            )}
          </div>

          {!isRefundable && ticket.status === "active" && (
            <p className="text-sm text-yellow-400 bg-yellow-900/20 rounded-lg p-3">
              This ticket cannot be refunded after being scanned at the event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
