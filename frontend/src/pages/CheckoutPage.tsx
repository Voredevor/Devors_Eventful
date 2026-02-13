import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { usePayment } from "@hooks/usePayment";
import { eventService } from "@services/eventService";
import { Event } from "@/types";
import { formatPrice } from "@utils/formatters";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiArrowLeft } from "react-icons/fi";

export default function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { initializePayment, verifyPayment, loading } = usePayment();

  const [event, setEvent] = useState<Event | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [step, setStep] = useState<"checkout" | "processing" | "success" | "failed">("checkout");

  const ticketId = location.state?.ticketId;

  useEffect(() => {
    if (!eventId) return;
    loadEvent();
  }, [eventId]);

  // Handle Paystack redirect
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      verifyPaymentAndRedirect(reference);
    }
  }, [searchParams]);

  const loadEvent = async () => {
    try {
      setEventLoading(true);
      const data = await eventService.getEventById(eventId!);
      setEvent(data);
    } catch (error) {
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setEventLoading(false);
    }
  };

  const verifyPaymentAndRedirect = async (reference: string) => {
    try {
      setStep("processing");
      const payment = await verifyPayment(reference);
      if (payment) {
        setStep("success");
        setTimeout(() => {
          navigate(`/tickets/${payment.ticketId}`);
        }, 2000);
      } else {
        setStep("failed");
      }
    } catch (error) {
      setStep("failed");
    }
  };

  const handlePayment = async () => {
    if (!eventId || !ticketId || !event) return;

    const result = await initializePayment(eventId, ticketId, event.price);
    if (result) {
      // Redirect to Paystack payment page
      window.location.href = result.authorizationUrl;
    }
  };

  if (eventLoading) {
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
          <button onClick={() => navigate("/events")} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {step === "checkout" && (
          <>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
            >
              <FiArrowLeft /> Back to Event
            </button>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
              <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>

              {/* Event Summary */}
              <div className="bg-gray-700 rounded-lg p-6 space-y-4 border border-gray-600">
                <div>
                  <p className="text-gray-400 text-sm">Event</p>
                  <p className="text-xl font-semibold text-white">{event.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white font-semibold">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-700 rounded-lg p-6 space-y-3 border border-gray-600">
                <div className="flex justify-between text-gray-300">
                  <span>Ticket Price</span>
                  <span>₦{formatPrice(event.price)}</span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-400">₦{formatPrice(event.price)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <p className="text-gray-400 text-sm mb-3">Payment Method</p>
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border-2 border-blue-600">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold">📳</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Paystack</p>
                    <p className="text-xs text-gray-400">Secure online payment</p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? "Processing..." : `Pay ₦${formatPrice(event.price)} with Paystack`}
              </button>

              {/* Security Info */}
              <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  🔒 Your payment is secure and encrypted by Paystack. We never store your card details.
                </p>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center py-16 space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-gray-400">Please wait while we confirm your payment...</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <FiCheck className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">Your ticket has been created. Redirecting...</p>
              <button
                onClick={() => navigate(`/tickets/${ticketId}`)}
                className="btn-primary"
              >
                View Your Ticket
              </button>
            </div>
          </div>
        )}

        {step === "failed" && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <FiX className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Payment Failed</h2>
              <p className="text-gray-400 mb-4">Something went wrong with your payment.</p>
              <button
                onClick={() => {
                  setStep("checkout");
                  window.history.replaceState({}, "", "/checkout/" + eventId);
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
