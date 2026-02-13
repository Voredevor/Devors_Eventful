import { useState, useCallback } from "react";
import {
  getEventAnalytics,
  getCreatorDashboard,
  getTrendingEvents,
  EventAnalytics,
  CreatorDashboard,
} from "../services/analyticsService";
import toast from "react-hot-toast";

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [dashboard, setDashboard] = useState<CreatorDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventAnalytics = useCallback(
    async (eventId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventAnalytics(eventId);
        setAnalytics(data);
        return data;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error?.message || "Failed to fetch analytics";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCreatorDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreatorDashboard();
      setDashboard(data);
      return data;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        "Failed to fetch creator dashboard";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrendingEvents = useCallback(async (limit: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrendingEvents(limit);
      return data;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        "Failed to fetch trending events";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    dashboard,
    loading,
    error,
    fetchEventAnalytics,
    fetchCreatorDashboard,
    fetchTrendingEvents,
  };
};
