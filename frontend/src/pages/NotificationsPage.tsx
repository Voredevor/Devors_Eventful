import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@hooks/useNotification";
import { formatDate } from "@utils/formatters";
import { FiArrowLeft, FiTrash2, FiCheckCircle, FiCircle } from "react-icons/fi";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, loading, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [currentPage] = useState(1);

  useEffect(() => {
    loadNotificationsData();
  }, [currentPage]);

  const loadNotificationsData = async () => {
    await loadNotifications(currentPage, 15);
    // TODO: Set total pages from response if available
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    const confirmed = window.confirm("Delete this notification?");
    if (confirmed) {
      await deleteNotification(notificationId);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition flex items-start justify-between group ${
                      notification.read ? "bg-gray-50" : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-1 text-gray-400 hover:text-blue-600 transition"
                      >
                        {notification.read ? (
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <FiCircle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                            {notification.deliveryMethod}
                          </span>
                          {notification.type && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {notification.type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
