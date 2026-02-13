import React from "react";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import NotificationBell from "@components/Notifications/NotificationBell";
import toast from "react-hot-toast";

const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const isCreator = user.userType === "creator";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eventful</h1>
            <p className="text-gray-600">Welcome, {user.firstName}!</p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiUser />
              Profile
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="btn btn-danger flex items-center gap-2 disabled:opacity-50"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium text-gray-700">Name:</span> {user.firstName}{" "}
                {user.lastName}
              </p>
              <p>
                <span className="font-medium text-gray-700">Email:</span> {user.email}
              </p>
              {user.phone && (
                <p>
                  <span className="font-medium text-gray-700">Phone:</span> {user.phone}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Account Type:</span>
                <span className="badge badge-primary ml-2">
                  {isCreator ? "Event Creator" : "Eventee"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="badge badge-success ml-2">
                  {user.verified ? "Verified" : "Unverified"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {isCreator ? (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Events Created</h3>
                <p className="text-3xl font-bold text-indigo-600">0</p>
                <button
                  onClick={() => navigate("/events/create")}
                  className="btn btn-primary mt-4 w-full"
                >
                  Create Event
                </button>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Attendees</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
                <button
                  onClick={() => navigate("/analytics")}
                  className="btn btn-secondary mt-4 w-full"
                >
                  View Analytics
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tickets Purchased</h3>
                <p className="text-3xl font-bold text-indigo-600">0</p>
                <button
                  onClick={() => navigate("/my-tickets")}
                  className="btn btn-primary mt-4 w-full"
                >
                  View Tickets
                </button>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Events</h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
                <button
                  onClick={() => navigate("/events")}
                  className="btn btn-secondary mt-4 w-full"
                >
                  Browse Events
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FiSettings className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <p className="font-medium">Settings</p>
            </button>

            {isCreator && (
              <>
                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                  <FiUser className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">My Events</p>
                </button>

                <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                  <FiUser className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Attendees</p>
                </button>
              </>
            )}

            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FiUser className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Notifications</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
