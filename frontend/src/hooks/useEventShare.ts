import { useState, useCallback } from "react";
import {
  shareEvent,
  getEventShareStats,
  getCreatorShareStats,
  getPopularPlatforms,
  ShareStats,
  CreatorShareStats,
  PlatformShare,
} from "../services/eventShareService";
import toast from "react-hot-toast";

export const useEventShare = () => {
  const [shareStats, setShareStats] = useState<ShareStats | null>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorShareStats | null>(
    null
  );
  const [popularPlatforms, setPopularPlatforms] = useState<PlatformShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShare = useCallback(
    async (eventId: string, platform: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await shareEvent(eventId, platform);
        toast.success(`Event shared on ${platform}!`);
        return data;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error?.message || "Failed to share event";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchShareStats = useCallback(
    async (eventId: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventShareStats(eventId);
        setShareStats(data);
        return data;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error?.message ||
          "Failed to fetch share statistics";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCreatorStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreatorShareStats();
      setCreatorStats(data);
      return data;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error?.message ||
        "Failed to fetch creator share stats";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPopularPlatforms = useCallback(
    async (eventId: string, limit: number = 5) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPopularPlatforms(eventId, limit);
        setPopularPlatforms(data);
        return data;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error?.message ||
          "Failed to fetch popular platforms";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    shareStats,
    creatorStats,
    popularPlatforms,
    loading,
    error,
    createShare,
    fetchShareStats,
    fetchCreatorStats,
    fetchPopularPlatforms,
  };
};
