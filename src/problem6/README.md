# Scoreboard API Module

## Overview

This module handles user score updates and broadcasts real-time updates to a scoreboard on a website. It leverages uWebSockets.js for real-time communication, JWT for authentication, PostgreSQL with TimescaleDB for persistent storage, Kafka for message queuing, and Redis for caching and rate limiting.

## Technology Choices

- **Database:** PostgreSQL with TimescaleDB (for real-time inserts and analytics)
- **Message Queue:** Kafka (for high-throughput, real-time streaming of score updates)
- **Rate Limiting:** Redis-based rate limiting (using a library like `nestjs-throttler` if using NestJS, or a similar approach for other frameworks)
- **Concurrency Handling:** Redis-based atomic updates (using `INCRBY`)
- **Caching:** Redis for storing top 10 scores and individual player scores
- **Real-time Communication:** uWebSockets.js

## API Design

### Endpoints

| Method | Endpoint        | Description                                  |
| ------ | --------------- | -------------------------------------------- |
| POST   | `/update-score` | Updates the score for a player.              |
| GET    | `/leaderboard`  | Fetches the top N scores (default: 10).      |
| WS     | `/live-updates` | WebSocket connection for live score updates. |

### `POST /update-score`

Updates a user's score.

**Authentication:** Requires a valid JWT in the `Authorization` header (Bearer token).

**Request Body:**

```json
{
  "playerId": "player123",
  "scoreDelta": 5
}
```

- `playerId`: (string, required) The ID of the player whose score is being updated.
- `scoreDelta`: (number, required) The amount to increment (or decrement, if negative) the player's score by.

**Response:**

- **200 OK:** Score updated successfully.
  ```json
  {
    "playerId": "player123",
    "newScore": 125
  }
  ```
- **400 Bad Request:** Invalid request body.
- **401 Unauthorized:** Missing or invalid JWT.
- **429 Too Many Requests:** Rate limit exceeded.
- **500 Internal Server Error:** An error occurred.

### `GET /leaderboard`

Fetches the top N scores.

**Query Parameters:**

- `limit`: (number, optional) The number of top scores to retrieve (default: 10).

**Response:**

- **200 OK:**
  ```json
  [
    { "playerId": "player456", "score": 200 },
    { "playerId": "player123", "score": 125 },
    ... // Up to N entries
  ]
  ```
- **500 Internal Server Error:** An error occurred.

### `WS /live-updates`

Establishes a WebSocket connection for receiving real-time score updates. Clients should connect to this endpoint to receive live updates to the leaderboard.

**WebSocket Message Format (Sent by Server):**

```json
{
  "type": "scoreUpdate", // Or "leaderboardUpdate"
  "playerId": "player123", // Optional, for individual score updates
  "newScore": 125,       // Optional, for individual score updates
  "topScores": [        // For leaderboard updates
    { "playerId": "player456", "score": 200 },
    { "playerId": "player123", "score": 125 },
    ...
  ]
}
```

## Data Flow & Synchronization

### A. Atomic Score Updates with Redis INCR

1.  **Client Request:** The client sends a `POST /update-score` request with `{ playerId, scoreDelta }` and a valid JWT.
2.  **Authentication:** The API service verifies the JWT.
3.  **Rate Limiting:** The API service checks the rate limit for the requesting IP address or user using Redis.
4.  **Redis Update:** If the request is not rate-limited, Redis updates the player's score atomically:
    ```javascript
    // Assuming 'redis' is a Redis client instance
    const newScore = await redis.incrby(`player:${playerId}:score`, scoreDelta);
    ```
5.  **Kafka Publish:** Redis publishes the update to a Kafka topic (e.g., `score-updates`). The message includes the `playerId` and `scoreDelta`.
6.  **WebSocket Broadcast:** A WebSocket server (using uWebSockets.js), subscribed to the Kafka topic, receives the update and broadcasts it to connected clients. The message format is shown above.
7.  **Leaderboard Update (Redis):** After updating the player's score, update the leaderboard in Redis:
    ```javascript
    await redis.zadd("leaderboard", newScore, playerId);
    ```

### B. Leaderboard Caching

- The top N scores are stored in a Redis sorted set (ZSET) named `leaderboard`. The score is the ZSET score, and the player ID is the ZSET member.
- On every score update (as described above), the `leaderboard` ZSET is updated using `redis.zadd`.
- When fetching the leaderboard (`GET /leaderboard`):
  1.  Attempt to retrieve the leaderboard from Redis using `redis.zrevrange('leaderboard', 0, limit - 1, 'WITHSCORES')`.
  2.  If the leaderboard is not found in Redis (e.g., on initial startup or after a Redis failure), fetch it from PostgreSQL and populate the Redis cache.

### C. PostgreSQL Sync Process

A background worker (implemented as a Kafka consumer or a scheduled task/cron job) periodically syncs Redis scores with PostgreSQL. This provides persistence and allows for more complex queries and analytics using TimescaleDB.

1.  **Kafka Consumer (Recommended):** A Kafka consumer subscribes to the `score-updates` topic. For each message:

    - Extract the `playerId` and `scoreDelta`.
    - Execute the following SQL query (using parameterized queries to prevent SQL injection):
      ```sql
      INSERT INTO scores (player_id, score, updated_at)
      VALUES ($1, (SELECT COALESCE(score, 0) + $2 FROM scores WHERE player_id = $1), NOW())
      ON CONFLICT (player_id) DO UPDATE
      SET score = EXCLUDED.score, updated_at = NOW();
      ```
      This query efficiently handles both inserts and updates. `COALESCE` handles the case where the player doesn't exist yet.

2.  **Scheduled Task (Alternative):** A scheduled task (e.g., a cron job) could periodically read the current scores from Redis and update PostgreSQL. This approach is less real-time than the Kafka consumer approach.

## Data Structures

- **Redis:**

  - `player:{playerId}:score`: (string) Stores the current score for each player.
  - `leaderboard`: (sorted set) Stores the top N players and their scores.
  - Rate limiting keys (structure depends on the rate limiting library used).

- **PostgreSQL (TimescaleDB):**

  ```sql
  CREATE TABLE scores (
      player_id TEXT PRIMARY KEY,
      score INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Convert the table to a hypertable for TimescaleDB
  SELECT create_hypertable('scores', 'updated_at');

  -- (Optional) Create an index on player_id if it's not already a primary key
  -- CREATE INDEX ON scores (player_id);
  ```

## Setup and Installation

1.  **Install Dependencies:**
    ```bash
    npm install uWebSockets.js jsonwebtoken redis kafkajs pg  # Add other dependencies as needed
    ```
2.  **Environment Variables:**
    - `JWT_SECRET`: Secret key for JWT signing/verification.
    - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis connection details.
    - `KAFKA_BROKERS`: Comma-separated list of Kafka brokers.
    - `DATABASE_URL`: PostgreSQL connection string.

## Improvements and Considerations

- **Error Handling:** Implement comprehensive error handling, logging, and monitoring.
- **Scalability:** The architecture is designed for scalability.
- **Testing:** Write thorough unit, integration, and load tests.
- **Monitoring:** Monitor key metrics.
- **Backpressure:** Implement backpressure handling in the WebSocket server (occurs when the server sends messages faster than a client can process them, leading to memory buildup and potential crashe). E.g we can limit the Number of Messages Sent Per Interval (Throttling)
