import Redis, { type RedisOptions } from "ioredis";

// Sentinel configuration
const sentinelOptions: RedisOptions = {
  sentinels: [
    { host: process.env.IS_DOCKER === 'true' ? 'redis-sentinel-1' : '127.0.0.1', port: 26379 },
    { host: process.env.IS_DOCKER === 'true' ? 'redis-sentinel-2' : '127.0.0.1', port: 26380 },
    { host: process.env.IS_DOCKER === 'true' ? 'redis-sentinel-3' : '127.0.0.1', port: 26381 },
  ],
  name: 'mymaster', // Must match the master name configured in Sentinel
  role: 'master',   // Connect to the master for write operations
  
  // Retry strategy for the connection
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000);
  },
  
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Reconnect to get the new master if we accidentally hit a node that became a replica
      return true;
    }
    return false;
  }
};

// Create the Sentinel-managed Redis instance
const redisSentinel = new Redis(sentinelOptions);

redisSentinel.on('connect', () => {
  console.log('✅ Connected to Redis via Sentinel');
});

redisSentinel.on('error', (err) => {
  console.error('❌ Redis Sentinel Error:', err.message);
});

// For Read-Only operations (Optional: scale reads to replicas)
const redisSentinelReplica = new Redis({
  ...sentinelOptions,
  role: 'slave', // Specifically target replicas
});

export { redisSentinel, redisSentinelReplica };
export default redisSentinel;
