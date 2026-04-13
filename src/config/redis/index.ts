import redisCluster from "./redis-client.ts";
import redisSentinel from "./sentinel-client.ts";

const useSentinel = process.env.USE_SENTINEL === 'true';

// Export the active client based on environment configuration
const redisClient = useSentinel ? redisSentinel : redisCluster;

export default redisClient;
export { redisCluster, redisSentinel };
