# Redis Cluster Node.js Demo

This project demonstrates a robust integration of a Node.js Express application with a Redis Cluster. It includes a fully dockerized environment with a 6-node Redis Cluster (3 masters, 3 replicas) and implements advanced caching patterns.

## 🚀 Features

- **Redis Cluster Setup**: Automated initialization of a 6-node Redis Cluster using Docker Compose.
- **Cache-Aside Pattern**: Efficiently manages data fetching between a (mocked) database and Redis.
- **Distributed Locking**: Prevents "thundering herd" (cache stampede) issues using atomic `SET NX EX` locks.
- **Resilient Redis Client**: Configured with `ioredis` Cluster mode, including retry strategies and auto-pipelining.
- **TypeScript**: Fully typed codebase for better maintainability and developer experience.
- **Observability**: Event listeners for Redis connection status, errors, and redirections.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Cache**: Redis (v7-alpine)
- **Client**: [ioredis](https://github.com/luin/ioredis)
- **Containerization**: Docker & Docker Compose

## 🏗️ Architecture

The project consists of:
1. **6 Redis Nodes**: Configured in cluster mode.
2. **Initialization Service**: A helper container that runs `redis-cli --cluster create` once all nodes are healthy.
3. **Backend Service**: An Express API that interacts with the cluster.

### Key Logic: `getOrSet`
The `CacheService` implements a robust `getOrSet` method:
1. Try to fetch from Redis.
2. If it's a **miss**, acquire a distributed lock.
3. Once the lock is acquired, re-check the cache (double-checked locking).
4. Fetch from DB if still a miss.
5. Populate cache and release lock.

## 🚦 Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Running with Docker (Recommended)
This is the easiest way to see the cluster in action:

```bash
docker-compose up --build
```

This will:
- Start 6 Redis nodes.
- Initialize the cluster (3 masters, 3 replicas).
- Start the backend API on `http://localhost:3000`.

### Running Locally
If you want to run the backend locally while Redis is in Docker:
1. Ensure the Redis nodes are exposed (default ports 7000-7005).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

### Fetch User Profile
Fetches a user profile, utilizing the Redis Cluster for caching.

- **URL**: `/api/v1/user/fetch-user-profile/:userId`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "data": {
        "id": "123",
        "name": "Mohammed",
        "role": "Senior Engineer"
      }
    }
    ```

## ⚙️ Configuration

- `redis-node.conf`: Redis cluster configuration (port, cluster-enabled, etc.).
- `init-cluster.sh`: Script used by Docker to join nodes into a cluster.
- `src/config/redis/redis-client.ts`: Connection logic for `ioredis`.

## 📜 License
ISC
