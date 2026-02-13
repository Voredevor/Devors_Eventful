import { createClient, RedisClientType } from "redis";
import config from "./environment";

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<RedisClientType> => {
  try {
    const password = config.redis.password
      ? `:${encodeURIComponent(config.redis.password)}@`
      : "";
    const url = `redis://${password}${config.redis.host}:${config.redis.port}/${config.redis.db}`;

    redisClient = createClient({
      url,
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));

    await redisClient.connect();
    console.log("✓ Redis connection initialized successfully");

    return redisClient;
  } catch (error) {
    console.error("✗ Failed to initialize Redis connection:", error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call initializeRedis first.");
  }
  return redisClient;
};

export { redisClient };

export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log("✓ Redis connection closed");
      redisClient = null;
    }
  } catch (error) {
    console.error("✗ Failed to close Redis connection:", error);
  }
};

// Helper functions for Redis operations
export const cacheGet = async (key: string): Promise<string | null> => {
  return getRedisClient().get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  ttl?: number
): Promise<void> => {
  const client = getRedisClient();
  if (ttl) {
    await client.setEx(key, ttl, value);
  } else {
    await client.set(key, value);
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  await getRedisClient().del(key);
};

export const cacheSetObject = async (
  key: string,
  value: Record<string, unknown> | unknown,
  ttl?: number
): Promise<void> => {
  await cacheSet(key, JSON.stringify(value), ttl);
};

export const cacheGetObject = async <T>(key: string): Promise<T | null> => {
  const value = await cacheGet(key);
  return value ? JSON.parse(value) : null;
};
