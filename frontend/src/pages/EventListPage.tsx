import { useState, useEffect } from "react";
import { eventService } from "@services/eventService";
import { Event, EventFilters } from "@/types";
import toast from "react-hot-toast";
import { formatPrice, formatDate } from "@utils/formatters";
import { FiSearch, FiFilter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function EventListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getPublishedEvents(filters);
      setEvents(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages || Math.ceil(response.pagination.total / (filters.limit || 12)));
      }
    } catch (error) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category: category || undefined, page: 1 }));
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = ["Concerts", "Sports", "Tech", "Business", "Entertainment", "Other"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Events</h1>
          <p className="text-gray-400 text-lg">Find and attend amazing events near you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6 sticky top-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 lg:hidden w-full btn-primary mb-4"
              >
                <FiFilter /> {showFilters ? "Hide" : "Show"} Filters
              </button>

              {(showFilters || window.innerWidth >= 1024) && (
                <>
                  {/* Search */}
                  <div>
                    <label className="block text-white font-semibold mb-3">Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-3 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-white font-semibold mb-3">Category</label>
                    <select
                      value={filters.category || ""}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-white font-semibold mb-3">Price Range</label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min price"
                        onChange={(e) => handlePriceChange(e.target.value ? Number(e.target.value) : undefined, filters.maxPrice)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max price"
                        onChange={(e) => handlePriceChange(filters.minPrice, e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => setFilters({ page: 1, limit: 12 })}
                    className="w-full btn-secondary text-sm"
                  >
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onView={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                          filters.page === page
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
                <p className="text-gray-400 text-lg">No events found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onView: () => void;
}

function EventCard({ event, onView }: EventCardProps) {
  const availableTickets = event.totalTickets - event.soldTickets;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden group hover:shadow-2xl transition cursor-pointer" onClick={onView}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-40 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isSoldOut ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}>
            {isSoldOut ? "Sold Out" : `${availableTickets} Left`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3 bg-gray-800">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-400">{event.location}</p>
        </div>

        <p className="text-sm text-gray-300 line-clamp-2">{event.description}</p>

        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-2xl font-bold text-white">₦{formatPrice(event.price)}</span>
          <span className="text-xs text-gray-400">{formatDate(event.startDate)}</span>
        </div>
      </div>
    </div>
  );
}
