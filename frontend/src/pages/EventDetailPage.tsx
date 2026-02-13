import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "@services/eventService";
import { Event } from "@/types";
import { formatPrice, formatDate } from "@utils/formatters";
import { useAuth } from "@hooks/useAuth";
import { useTicket } from "@hooks/useTicket";
import toast from "react-hot-toast";
import { FiMapPin, FiCalendar, FiUsers, FiShare2, FiArrowLeft } from "react-icons/fi";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { purchaseTicket, loading: purchasing } = useTicket();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(eventId!);
      setEvent(data);
    } catch (error) {
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendEvent = async () => {
    if (!user) {
      toast.error("Please login to attend events");
      navigate("/login");
      return;
    }

    if (!eventId) return;

    const ticket = await purchaseTicket(eventId);
    if (ticket) {
      navigate(`/checkout/${eventId}`, {
        state: { ticketId: ticket.id },
      });
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = event?.title || "Check out this event!";

    const shareLinks: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      copy: url,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } else {
      window.open(shareLinks[platform], "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Event not found</p>
          <button
            onClick={() => navigate("/events")}
            className="btn-primary"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const availableTickets = event.totalTickets - event.soldTickets;
  const isSoldOut = availableTickets <= 0;
  const daysUntilEvent = Math.ceil(
    (new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FiArrowLeft /> Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm opacity-75">Featured Event</p>
                  <h1 className="text-4xl font-bold mt-2">{event.title}</h1>
                </div>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard
                icon={<FiCalendar />}
                label="Date"
                value={formatDate(event.startDate)}
              />
              <InfoCard
                icon={<FiMapPin />}
                label="Location"
                value={event.location}
              />
              <InfoCard
                icon={<FiUsers />}
                label="Attendees"
                value={`${event.soldTickets}/${event.totalTickets}`}
              />
              <InfoCard
                icon="⏳"
                label="In"
                value={daysUntilEvent > 0 ? `${daysUntilEvent}d` : "Started"}
              />
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
              <h2 className="text-2xl font-bold text-white">About This Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Category</h3>
                <span className="badge bg-indigo-100 text-indigo-800">{event.category}</span>
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Share Event</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <FiShare2 /> Facebook
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition"
                >
                  <FiShare2 /> Twitter
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <FiShare2 /> WhatsApp
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <FiShare2 /> Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Price per ticket</p>
                <p className="text-4xl font-bold text-white">₦{formatPrice(event.price)}</p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-2">Tickets Available</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">{availableTickets}</p>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isSoldOut
                      ? "bg-red-500 text-white"
                      : availableTickets < 10
                      ? "bg-yellow-500 text-white"
                      : "bg-green-500 text-white"
                  }`}>
                    {isSoldOut ? "Sold Out" : availableTickets < 10 ? "Hurry!" : "Available"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Starts</p>
                  <p className="text-white font-semibold">{formatDate(event.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Ends</p>
                  <p className="text-white font-semibold">{formatDate(event.endDate)}</p>
                </div>
              </div>

              <button
                onClick={handleAttendEvent}
                disabled={isSoldOut || purchasing}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isSoldOut || purchasing
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "btn-primary"
                }`}
              >
                {purchasing ? "Processing..." : isSoldOut ? "Event Sold Out" : "Get Ticket"}
              </button>

              {event.reminderDefault && (
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm">
                  Set Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center border border-gray-700">
      <div className="text-2xl text-blue-400 mb-2">{icon}</div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold mt-1 break-all">{value}</p>
    </div>
  );
}
