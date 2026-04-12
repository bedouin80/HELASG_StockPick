# node-red-contrib-cluster-leader

Leader election node for Node-RED cluster deployments using Redis/Valkey.

## Overview

When running Node-RED in a clustered environment (multiple replicas), scheduled jobs (inject nodes with intervals/cron) will execute on **all replicas simultaneously**, causing duplicate execution. This node solves that problem by implementing distributed leader election.

## Features

- ✅ **Distributed Leader Election**: Only ONE replica executes scheduled jobs
- ✅ **Automatic Failover**: If leader dies, another replica becomes leader automatically
- ✅ **Real-time Status**: Visual indicator shows leader/follower status
- ✅ **Multiple Lock Groups**: Distribute different jobs across different leaders
- ✅ **Redis/Valkey Compatible**: Works with both Redis and Valkey
- ✅ **Zero Configuration**: Works out of the box with environment variables

## Installation

### In Node-RED Container

```bash
cd /data
npm install node-red-contrib-cluster-leader
# Restart Node-RED
```

### Via Docker Volume

```bash
# On host machine
cd smartorchestra/node-red-contrib-cluster-leader
npm install
npm pack
# Copy to Node-RED data volume
docker cp node-red-contrib-cluster-leader-1.0.0.tgz <container>:/data/
docker exec <container> bash -c "cd /data && npm install node-red-contrib-cluster-leader-1.0.0.tgz"
docker restart <container>
```

## Quick Start

### 1. Add Valkey Config Node (Optional)

If not using environment variables:
- Add a new Valkey Config node
- Set host, port, and database
- Save configuration

### 2. Use Cluster Leader Node

```
[Inject: Every 1 min] → [Cluster Leader] → [Your Job]
                             ↓
                        (only leader executes)
```

### 3. Configure

- **Lock Key**: `nodered:leader` (default) - use different keys for different jobs
- **Lock TTL**: `10` seconds (default) - time before lock expires

## Usage Examples

### Example 1: Simple Scheduled Job

```json
[
  {
    "id": "inject1",
    "type": "inject",
    "repeat": "60",
    "name": "Every Minute",
    "wires": [["leader1"]]
  },
  {
    "id": "leader1",
    "type": "cluster-leader",
    "lockKey": "nodered:leader",
    "lockTTL": 10,
    "wires": [["job1"], []]
  },
  {
    "id": "job1",
    "type": "http request",
    "method": "POST",
    "url": "http://api/job",
    "wires": [[]]
  }
]
```

### Example 2: Multiple Jobs with Distributed Leadership

```
Job A (every 1 min):
[Inject] → [Leader: key="job-a"] → [HTTP Request A]

Job B (every 5 min):
[Inject] → [Leader: key="job-b"] → [HTTP Request B]

Job C (every 10 min):
[Inject] → [Leader: key="job-c"] → [HTTP Request C]
```

Result: Each job has a different leader, distributing load across the cluster.

### Example 3: Follower Actions

```
[Inject] → [Cluster Leader]
               ↓          ↓
           (leader)   (follower)
               ↓          ↓
         [Execute]  [Log Skip]
```

Use output 2 to log or metric when a job is skipped on followers.

## Configuration

### Environment Variables

If no Valkey Config node is specified, the plugin uses:

```bash
REDIS_HOST=redis       # Default: redis
REDIS_PORT=6379        # Default: 6379
HOSTNAME=<unique-id>   # Auto-detected
```

### Lock Key Strategy

- **Single Leader**: Use same lock key for all jobs → one leader for everything
- **Distributed Leadership**: Use different lock keys → different leaders for different jobs

```javascript
lockKey: "nodered:leader"        // All jobs share one leader
lockKey: "nodered:job-database"  // Database jobs have dedicated leader
lockKey: "nodered:job-api"       // API jobs have dedicated leader
```

### Lock TTL (Time-To-Live)

- **Too Short** (<5s): Frequent leadership changes, poor performance
- **Too Long** (>60s): Slow failover if leader dies
- **Recommended**: 10-30 seconds depending on job frequency

## Architecture

### How It Works

1. **Leader Election**: Each replica tries to acquire a Redis lock with `SET key value NX EX ttl`
2. **Only One Wins**: The replica that successfully sets the key becomes the leader
3. **Heartbeat**: Leader refreshes the lock every 2 seconds
4. **Auto-Failover**: If leader dies, lock expires after TTL, another replica becomes leader

### Redis Commands Used

```redis
SET nodered:leader hostname NX EX 10  # Try to become leader
GET nodered:leader                     # Check current leader
EXPIRE nodered:leader 10               # Refresh leadership
DEL nodered:leader                     # Release leadership (on shutdown)
```

## Troubleshooting

### All Replicas Show "Follower"

**Problem**: No leader elected
**Solution**:
- Check Redis connectivity: `docker exec <container> curl redis:6379`
- Verify lock key is the same across all replicas
- Check Redis logs for errors

### Multiple Leaders

**Problem**: More than one replica acts as leader
**Solution**:
- Ensure all replicas use the **exact same lock key**
- Check for clock skew between nodes
- Verify Redis is not partitioned

### No Failover After Leader Dies

**Problem**: New leader not elected
**Solution**:
- Increase Lock TTL (e.g., 30 seconds)
- Check network connectivity to Redis
- Verify other replicas are healthy

### High Redis Load

**Problem**: Too many Redis operations
**Solution**:
- Increase heartbeat interval (modify code)
- Use separate Redis instance for leader election
- Reduce number of leader nodes

## Docker Swarm Example

### docker-compose.swarm.yml

```yaml
services:
  redis:
    image: valkey/valkey:8-alpine
    networks:
      - orchestra

  nodered-admin:
    image: nodered/node-red:4.1.0
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - nodered_data:/data
    deploy:
      replicas: 1

  nodered-worker:
    image: nodered/node-red:4.1.0
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - nodered_data:/data:ro
    deploy:
      replicas: 3  # Multiple workers
```

### Installation Script

```bash
#!/bin/bash
# Install plugin on all Node-RED instances
for service in nodered-admin nodered-worker; do
    echo "Installing on $service..."
    docker exec $(docker ps -q -f name=${service}) bash -c \
        "cd /data && npm install node-red-contrib-cluster-leader && pm2 restart all"
done
```

## Development

### Build

```bash
npm install
npm pack
```

### Test Locally

```bash
# Terminal 1: Start Redis
docker run -d -p 6379:6379 valkey/valkey:8-alpine

# Terminal 2-4: Start 3 Node-RED instances
docker run -p 1880:1880 -e REDIS_HOST=localhost nodered/node-red
docker run -p 1881:1880 -e REDIS_HOST=localhost nodered/node-red
docker run -p 1882:1880 -e REDIS_HOST=localhost nodered/node-red

# Install plugin in each instance
# Test with scheduled flows
```

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
- Code follows existing style
- Tests pass (if applicable)
- Documentation is updated

## Support

For issues and questions:
- GitHub Issues: https://github.com/Siphion/node-red-contrib-cluster-leader/issues

## Changelog

### 1.0.0 (2025-01-30)
- Initial release
- Basic leader election with Redis/Valkey
- Valkey config node
- Status monitoring and heartbeat
- Auto-failover on leader death
- Multiple lock group support
