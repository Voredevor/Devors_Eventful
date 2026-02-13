import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";
import { FiArrowRight, FiCalendar, FiCreditCard, FiBarChart2, FiShare2 } from "react-icons/fi";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Discover Events",
      description: "Browse and filter thousands of amazing events happening near you",
    },
    {
      icon: <FiCreditCard className="w-8 h-8" />,
      title: "Easy Booking",
      description: "Purchase tickets securely with instant confirmation and QR codes",
    },
    {
      icon: <FiShare2 className="w-8 h-8" />,
      title: "Share & Invite",
      description: "Share events on social media and invite friends to experience together",
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: "Event Management",
      description: "Create and manage events with powerful analytics and attendee tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Devor's Eventful</h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Your frigging passport to a world of unforgettable moments. From concerts to sports,
            theater to cultural gatherings, even down to your wildest dreams - discover and attend the events you love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="btn bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
            >
              Explore Events
              <FiArrowRight />
            </Link>
            <Link
              to="/register?type=creator"
              className="btn border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold transition-colors"
            >
              Host an Event
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Why Choose Eventful?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We make it simple to discover, book, and manage events
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4 text-indigo-600">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users discovering amazing events or hosting their own
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
