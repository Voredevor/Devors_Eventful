import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTicket } from "@hooks/useTicket";
import { Ticket } from "@/types";
import { formatDate } from "@utils/formatters";
import toast from "react-hot-toast";
import { FiArrowLeft, FiChevronRight, FiCalendar, FiMapPin } from "react-icons/fi";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { getMyTickets, loading } = useTicket();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTickets();
  }, [currentPage]);

  const loadTickets = async () => {
    try {
      const response = await getMyTickets(currentPage, 12);
      setTickets(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1);
      }
    } catch (error) {
      toast.error("Failed to load tickets");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">View and manage your event tickets</p>
        </div>

        {loading && tickets.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          </div>
        ) : tickets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onView={() => navigate(`/tickets/${ticket.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-6">You haven't purchased any tickets yet</p>
            <button
              onClick={() => navigate("/events")}
              className="btn-primary"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  onView: () => void;
}

function TicketCard({ ticket, onView }: TicketCardProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    used: "bg-blue-500",
    refunded: "bg-red-500",
  };

  return (
    <div
      className="bg-gray-800 rounded-lg border border-gray-700 p-6 group hover:shadow-2xl transition cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition line-clamp-2">
            {ticket.event?.title}
          </h3>
          <p className="text-sm text-gray-400">{ticket.event?.location}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap ${
            statusColors[ticket.status]
          }`}
        >
          {ticket.status}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-300 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          {formatDate(ticket.event?.startDate || ticket.purchaseDate)}
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="w-4 h-4 text-gray-500" />
          {ticket.event?.location}
        </div>
      </div>

      {ticket.qrScanned && (
        <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-2 mb-4">
          <p className="text-green-300 text-xs font-semibold">✓ Scanned at event</p>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center gap-2"
      >
        View Ticket <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
