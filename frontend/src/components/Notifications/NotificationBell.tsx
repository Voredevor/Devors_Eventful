import { useState, useEffect } from "react";
import { useNotification } from "@hooks/useNotification";
import { useNavigate } from "react-router-dom";
import { FiBell, FiX } from "react-icons/fi";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, getUnreadCount } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount();
    }, 30000);

    // Get initial count
    getUnreadCount();

    return () => clearInterval(interval);
  }, [getUnreadCount]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/notifications");
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex justify-between items-center group"
            >
              <span className="text-blue-600 font-semibold group-hover:text-blue-700">
                View all notifications
              </span>
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
