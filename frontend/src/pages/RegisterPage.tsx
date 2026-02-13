import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";
import RegisterForm from "@components/Auth/RegisterForm";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Eventful</h1>
            <p className="text-gray-600 mt-2">Your passport to unforgettable moments</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Join Eventful</h2>
            <p className="text-gray-600 text-center mt-2">Create your account in minutes</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
