# Redis High Availability Demo (Cluster & Sentinel)

This project demonstrates a robust integration of a Node.js Express application with both **Redis Cluster** and **Redis Sentinel**. It includes a fully dockerized environment with a 6-node Redis Cluster and a Sentinel-managed Master-Replica setup, providing two different ways to achieve high availability and scalability.

## 🚀 Features

- **Dual Mode Support**: Seamlessly switch between **Redis Cluster** and **Redis Sentinel** using environment variables.
- **Redis Cluster Setup**: Automated initialization of a 6-node Redis Cluster (3 masters, 3 replicas).
- **Redis Sentinel HA**: High Availability setup with a Master, Replica, and 3 Sentinel nodes for automatic failover.
- **Cache-Aside Pattern**: Efficiently manages data fetching between a (mocked) database and Redis.
- **Distributed Locking**: Prevents "thundering herd" (cache stampede) issues using atomic `SET NX EX` locks.
- **Resilient Redis Client**: Configured with `ioredis` for both Cluster and Sentinel modes, including retry strategies.
- **TypeScript**: Fully typed codebase for better maintainability.
- **Observability**: Event listeners for Redis connection status, errors, and redirections.

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Cache**: Redis (v7-alpine)
- **Client**: [ioredis](https://github.com/luin/ioredis)
- **Containerization**: Docker & Docker Compose

## 🏗️ Architecture

The project supports two high-availability architectures:

### 1. Redis Cluster (Scalability + HA)
- **6 Redis Nodes**: 3 Masters for data partitioning and 3 Replicas for redundancy.
- **Data Sharding**: Automatically distributes keys across 16,384 slots.
- **Initialization**: A helper service runs `redis-cli --cluster create` to bootstrap the cluster.

### 2. Redis Sentinel (High Availability)
- **Master-Replica**: One primary node for writes and one or more replicas for reads/redundancy.
- **3 Sentinel Nodes**: Monitor the master and perform automatic failover if it goes down.
- **Client Discovery**: The application asks Sentinels for the current master's address.

## ⚙️ Configuration

Control the Redis connection mode using the `USE_SENTINEL` environment variable in `docker-compose.yml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_SENTINEL` | Set to `true` to use Redis Sentinel, `false` for Redis Cluster. | `true` |
| `IS_DOCKER` | Set to `true` when running inside Docker to use container hostnames. | `true` |

## 🚦 Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Running with Docker (Recommended)
By default, the project starts with **Redis Sentinel** enabled.

```bash
docker-compose up --build
```

This will start:
- 6 Redis Cluster nodes (available but unused if `USE_SENTINEL=true`).
- 1 Redis Master and 1 Redis Replica.
- 3 Redis Sentinel nodes.
- The Backend API on `http://localhost:3000`.

### Switching to Redis Cluster
To use the Cluster instead of Sentinel, update your `docker-compose.yml`:

```yaml
backend:
  environment:
    - USE_SENTINEL=false
```

Then restart the services:
```bash
docker-compose up -d backend
```

## 🔌 API Endpoints

### Fetch User Profile
Fetches a user profile, utilizing the active Redis configuration for caching.

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

## 📂 Project Structure

- `src/config/redis/index.ts`: Unified client exporter (Cluster vs. Sentinel).
- `src/config/redis/redis-client.ts`: Cluster-specific connection and topology helpers.
- `src/config/redis/sentinel-client.ts`: Sentinel-specific connection logic.
- `src/services/cache-service.ts`: Core caching logic using the selected Redis client.

## 📜 License
ISC
