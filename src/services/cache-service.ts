

import redisClient from "../config/redis/index.ts";

export class CacheService {
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFromDb: () => Promise<T | null>
  ): Promise<T | null> {
    try {
      // try to get from cache
      const cachedValue = await redisClient.get(key);

      // cache hit
      if (cachedValue !== null)
        return JSON.parse(cachedValue) as T;
      // cache miss
      // -> use a distributed lock to prevent thundering herd
      // use SET NX EX for atomic lock acquisition
      const lockKey = `${key}:lock`;
      const lockAcquired = await redisClient.set(
        lockKey,
        '1',
        'EX',
        10,
        'NX'
      );

      if (lockAcquired == 'OK') {
        try {
          // double-check cache lock (another request might have filled it)
          const recheck = await redisClient.get(key);
          if (recheck != null)
            return JSON.parse(recheck) as T;

          // fetch data from db
          const data = await fetchFromDb();

          if (data != null)
            await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
          else
            // to prevent penetration attacks
            await redisClient.setex(key, 60, JSON.stringify(null));
          return data;
        } finally {
          // release the lock
          const res = await redisClient.del(lockKey);
        }
      }
      else{
        // Lock Not acquired: Wait briefly and retry recursively or return null
        // For simplicity, we wait 100ms and try again once
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getOrSet(key, ttlSeconds, fetchFromDb);
      }
    } catch (e) {
      console.error(`Error in getOrSet for key ${key}:`, e);
      return fetchFromDb();
    }
  }

  /*
    * Invalidate a key
   */
  async invalidate(key: string):Promise<void> {
    try{
      await  redisClient.del(key);
    }
    catch (e) {
      console.log(`Error invalidating key ${key}:`, e);
    }
  }
  /*
    * Example of using Hashes for structured data (More memory efficient)
   */
  async setUserProfile(userId: string, profile: Record<string, any> | null) {
    if (!profile) return;
    const key = `user:${userId}:profile`;

    // HSET in ioredis can take an object to set multiple fields at once
    await redisClient.hset(key, profile);
    // Set expiry on the hash
    await redisClient.expire(key, 3600);
  }

  async getUserProfile(userId: string):Promise<Record<string, any> | null> {
    const key = `user:${userId}:profile`;
    const exists = await redisClient.exists(key);
    if(!exists)
      return null;
    return redisClient.hgetall(key);
  }

}

export const cacheService = new CacheService();