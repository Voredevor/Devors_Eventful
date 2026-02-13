import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import { useEventShare } from "../hooks/useEventShare";

const platformIcons: { [key: string]: string } = {
  facebook: "f",
  twitter: "𝕏",
  whatsapp: "💬",
  instagram: "📷",
  email: "✉️",
};

export const EventShareStatsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { analytics, fetchEventAnalytics } =
    useAnalytics();
  const {
    shareStats,
    popularPlatforms,
    loading,
    fetchShareStats,
    fetchPopularPlatforms,
  } = useEventShare();

  useEffect(() => {
    if (!eventId) return;
    fetchEventAnalytics(eventId);
    fetchShareStats(eventId);
    fetchPopularPlatforms(eventId);
  }, [eventId, fetchEventAnalytics, fetchShareStats, fetchPopularPlatforms]);

  const platforms = Object.keys(shareStats?.sharesByPlatform || {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Event Sharing Analytics
          </h1>
          <p className="text-gray-600">Track how your event is being shared</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sharing stats...</p>
            </div>
          </div>
        ) : !shareStats ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sharing data available yet.</p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm font-medium">Total Shares</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {shareStats.totalShares}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm font-medium">
                  Unique Sharers
                </p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {shareStats.uniqueSharers}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <p className="text-gray-500 text-sm font-medium">
                  Active Platforms
                </p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {platforms.length}
                </p>
              </div>
            </div>

            {/* Shares by Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Platform Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Shares by Platform
                </h2>
                <div className="space-y-4">
                  {platforms.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No shares yet
                    </p>
                  ) : (
                    platforms.map((platform) => {
                      const count = shareStats.sharesByPlatform[platform];
                      const percentage =
                        (count / shareStats.totalShares) * 100;
                      return (
                        <div key={platform} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700 capitalize">
                              {platform}
                            </span>
                            <span className="text-sm font-bold text-gray-600">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Popular Platforms */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📈 Top Performing Platforms
                </h2>
                <div className="space-y-3">
                  {popularPlatforms.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No data yet
                    </p>
                  ) : (
                    popularPlatforms.map((platform, index) => (
                      <div
                        key={platform.platform}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {platformIcons[platform.platform] || "🔗"}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {platform.platform}
                            </p>
                            <p className="text-sm text-gray-500">
                              #{index + 1} Platform
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {platform.shareCount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Event Analytics Summary */}
            {analytics && (
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Event Performance Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Total Tickets Sold</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {analytics.totalTicketsSold}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Revenue Generated</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ₦{analytics.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">QR Scan Rate</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {analytics.qrScanRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                💡 Sharing Tips
              </h3>
              <ul className="text-blue-800 space-y-2">
                <li>
                  • Share on multiple platforms to reach a wider audience
                </li>
                <li>• Monday-Friday mornings see the highest engagement</li>
                <li>• Include event details when sharing to increase click-through</li>
                <li>• Monitor which platforms drive the most ticket sales</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
