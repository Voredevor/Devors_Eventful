import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { useEventShare } from "../hooks/useEventShare";

export const AnalyticsDashboardPage = () => {
  const { dashboard, loading, fetchCreatorDashboard } = useAnalytics();
  const { creatorStats, fetchCreatorStats } = useEventShare();

  useEffect(() => {
    fetchCreatorDashboard();
    fetchCreatorStats();
  }, [fetchCreatorDashboard, fetchCreatorStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No data available</h2>
          <p className="mt-2 text-gray-600">
            Start creating events to see your analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-600">Monitor your events and ticket sales</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.totalEvents}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₦{dashboard.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Attendees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.totalAttendees}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">QR Scan Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.averageQrScanRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Stats */}
        {creatorStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sharing Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Total Shares</p>
                <p className="text-2xl font-bold text-blue-600">
                  {creatorStats.totalSharesCreated}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Events Shared</p>
                <p className="text-2xl font-bold text-green-600">
                  {creatorStats.eventsShared}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Popular Platform</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.entries(creatorStats.sharesByPlatform).length > 0
                    ? Object.entries(creatorStats.sharesByPlatform).sort(
                        ([, a], [, b]) => b - a
                      )[0][0]
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event Metrics Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Event Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Tickets Sold
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    QR Scan Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboard.eventMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No events yet. Create your first event to see metrics.
                    </td>
                  </tr>
                ) : (
                  dashboard.eventMetrics.map((event) => (
                    <tr key={event.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {event.eventTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.totalTicketsSold}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ₦{event.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${event.qrScanRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-gray-600">
                            {event.qrScanRate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
