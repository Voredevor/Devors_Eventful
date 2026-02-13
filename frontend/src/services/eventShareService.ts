import { api as apiClient } from "./api";

export interface ShareStats {
  totalShares: number;
  sharesByPlatform: { [key: string]: number };
  uniqueSharers: number;
}

export interface CreatorShareStats {
  totalSharesCreated: number;
  sharesByPlatform: { [key: string]: number };
  eventsShared: number;
}

export interface PlatformShare {
  platform: string;
  shareCount: number;
}

export const shareEvent = async (
  eventId: string,
  platform: string
): Promise<{
  id: string;
  shareLink: string;
  shareUrl: string;
  platform: string;
}> => {
  const data = await apiClient.post<any>(`/events/${eventId}/share`, {
    platform,
  });
  return data.data;
};

export const getEventShareStats = async (
  eventId: string
): Promise<ShareStats> => {
  const data = await apiClient.get<any>(`/events/${eventId}/share-stats`);
  return data.data;
};

export const getEventShares = async (eventId: string) => {
  const data = await apiClient.get<any>(`/events/${eventId}/shares`);
  return data.data;
};

export const getCreatorShareStats = async (): Promise<CreatorShareStats> => {
  const data = await apiClient.get<any>(`/events/creator/stats`);
  return data.data;
};

export const getPopularPlatforms = async (
  eventId: string,
  limit: number = 5
): Promise<PlatformShare[]> => {
  const data = await apiClient.get<any>(
    `/events/${eventId}/popular-platforms?limit=${limit}`
  );
  return data.data;
};
