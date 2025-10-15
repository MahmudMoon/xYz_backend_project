# 🚀 Deployment Guide - Express Learning Project

## 📋 Overview

Complete deployment guide for the Express.js application covering development, staging, and production environments with security best practices.

---

## 🏗️ Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV[Local Development]
        DEV_DB[(Local MongoDB)]
        DEV --> DEV_DB
    end

    subgraph "Staging"
        STAGE[Staging Server]
        STAGE_DB[(Staging MongoDB)]
        STAGE --> STAGE_DB
    end

    subgraph "Production"
        LB[Load Balancer]
        PROD1[Production Server 1]
        PROD2[Production Server 2]
        PROD_DB[(Production MongoDB Cluster)]
        REDIS[(Redis Cache)]

        LB --> PROD1
        LB --> PROD2
        PROD1 --> PROD_DB
        PROD2 --> PROD_DB
        PROD1 --> REDIS
        PROD2 --> REDIS
    end
```

---

## 🔧 Environment Configuration

### Development Environment

```env
# .env.development
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/express_learning_dev

# JWT Configuration
JWT_SECRET=development_jwt_secret_32_characters_minimum
JWT_EXPIRES_IN=24h
DEVICE_JWT_EXPIRES_IN=5m

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/development.log

# Security (Relaxed for development)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
AUTH_RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW=900000

# Development Features
SWAGGER_ENABLED=true
DEBUG_MODE=true
```

### Staging Environment

```env
# .env.staging
NODE_ENV=staging
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@staging-cluster.mongodb.net/express_learning_staging?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=staging_jwt_secret_64_characters_minimum_secure_random_string
JWT_EXPIRES_IN=24h
DEVICE_JWT_EXPIRES_IN=5m

# Logging
LOG_LEVEL=info
LOG_FILE=logs/staging.log

# Security
CORS_ORIGIN=https://staging-app.yourdomain.com
AUTH_RATE_LIMIT_MAX=20
AUTH_RATE_LIMIT_WINDOW=900000

# Features
SWAGGER_ENABLED=true
DEBUG_MODE=false
```

### Production Environment

```env
# .env.production
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://prod_user:secure_password@production-cluster.mongodb.net/express_learning_prod?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=production_ultra_secure_jwt_secret_128_characters_minimum_cryptographically_random_string_generated_securely
JWT_EXPIRES_IN=24h
DEVICE_JWT_EXPIRES_IN=5m

# Logging
LOG_LEVEL=warn
LOG_FILE=logs/production.log
ERROR_LOG_FILE=logs/error.log

# Security
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=900000

# Production Features
SWAGGER_ENABLED=false
DEBUG_MODE=false

# Performance
CLUSTER_MODE=true
REDIS_URL=redis://redis-cluster.internal:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
HEALTH_CHECK_ENDPOINT=/health
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Remove development files
RUN rm -rf tests/ docs/ coverage/ *.md

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S express -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=express:nodejs /app ./

# Create logs directory
RUN mkdir -p logs && chown express:nodejs logs

# Switch to app user
USER express

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/express_learning
      - JWT_SECRET=development_jwt_secret_32_characters_minimum
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=express_learning
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Docker Compose (Production)

```yaml
# docker-compose.production.yml
version: "3.8"

services:
  app:
    image: your-registry/express-learning:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs:rw
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## 🌐 Nginx Configuration

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream express_backend {
        server app:3000;
        # Add more servers for load balancing
        # server app2:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_dhparam /etc/ssl/dhparam.pem;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL Certificates
        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;

        # Logging
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # API Routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://express_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Authentication Routes (Stricter rate limiting)
        location ~ ^/(api/admin/verify|api/admin/create|device/auth) {
            limit_req zone=auth burst=5 nodelay;

            proxy_pass http://express_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health Check
        location /health {
            proxy_pass http://express_backend;
            access_log off;
        }

        # Static Files (if any)
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Block sensitive files
        location ~ /\.(env|git|svn) {
            deny all;
            return 404;
        }
    }
}
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Setup

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# t3.medium recommended for production

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/yourusername/express-learning.git
cd express-learning

# Setup environment
cp .env.example .env.production
# Edit .env.production with production values

# Deploy
docker-compose -f docker-compose.production.yml up -d
```

#### 2. RDS (MongoDB Atlas Alternative)

```bash
# Setup MongoDB Atlas
# 1. Create cluster at https://cloud.mongodb.com
# 2. Configure network access (your EC2 IP)
# 3. Create database user
# 4. Get connection string

# Update .env.production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

#### 3. Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name express-learning-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678

# Create target group
aws elbv2 create-target-group \
    --name express-learning-targets \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-12345678 \
    --health-check-path /health
```

### Google Cloud Platform

```yaml
# app.yaml (App Engine)
runtime: nodejs18

env_variables:
  NODE_ENV: production
  MONGODB_URI: mongodb+srv://...
  JWT_SECRET: your-production-secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 1
  disk_size_gb: 10

handlers:
  - url: /.*
    script: auto
    secure: always
```

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create express-learning-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-production-secret

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## 🛡️ Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**: All secrets in environment variables, not code
- [ ] **HTTPS**: SSL/TLS certificates properly configured
- [ ] **Database Security**: MongoDB authentication and network restrictions
- [ ] **CORS Configuration**: Restrictive CORS settings for production domains
- [ ] **Rate Limiting**: Aggressive rate limiting on authentication endpoints
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Error Handling**: Error messages don't expose sensitive information
- [ ] **Dependencies**: All dependencies updated and scanned for vulnerabilities
- [ ] **Logging**: Sensitive data not logged (passwords, tokens)
- [ ] **File Permissions**: Proper file system permissions

### Runtime Security

```bash
# Security scanning
npm audit --production

# Check for common vulnerabilities
npx snyk test

# Container security scanning
docker scan your-image:latest

# SSL certificate verification
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### 1. Health Checks

```javascript
// Enhanced health check endpoint
app.get("/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    database: {
      connected: false,
      status: "disconnected",
    },
  };

  try {
    // Test database connection
    await mongoose.connection.db.admin().ping();
    health.database = {
      connected: true,
      status: "connected",
    };

    res.status(200).json(health);
  } catch (error) {
    health.status = "ERROR";
    health.database.error = error.message;
    res.status(503).json(health);
  }
});
```

#### 2. Prometheus Metrics

```javascript
// metrics.js
const client = require("prom-client");

// Default metrics
client.collectDefaultMetrics();

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
});

const activeConnections = new client.Gauge({
  name: "active_connections",
  help: "Active connections to the server",
});

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  register: client.register,
};
```

### Logging Configuration

```javascript
// logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "express-learning" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          JWT_SECRET: test_secret_32_characters_minimum

      - name: Run security audit
        run: npm audit --audit-level=high

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_REGISTRY }}/express-learning:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/express-learning
            docker-compose pull
            docker-compose up -d
            docker system prune -f
```

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t express-learning:latest .

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose -f docker-compose.production.yml up -d

# Wait for health check
echo "🏥 Waiting for health check..."
sleep 30

# Verify deployment
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed - rolling back..."
    docker-compose -f docker-compose.production.yml down
    # Restore previous version logic here
    exit 1
fi

# Clean up old images
docker system prune -f

echo "🎉 Deployment completed successfully!"
```

---

## 📈 Performance Optimization

### Production Optimizations

```javascript
// server.js optimizations
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster && process.env.CLUSTER_MODE === "true") {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require("./src/app");
}
```

### Caching Strategy

```javascript
// Redis caching
const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
};
```

---

## 🆘 Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Issues

```bash
# Check MongoDB connection
mongosh "mongodb+srv://cluster.mongodb.net/test" --username username

# Test from application
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Connection failed:', err));
"
```

#### 2. Environment Variables

```bash
# Verify environment variables
node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
```

#### 3. Container Issues

```bash
# Check container logs
docker logs container_name

# Enter container for debugging
docker exec -it container_name sh

# Check container resources
docker stats
```

#### 4. SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in cert.pem -text -noout | grep "Not After"

# Test SSL configuration
curl -I https://your-domain.com
```

### Recovery Procedures

#### 1. Database Recovery

```bash
# MongoDB backup
mongodump --uri "mongodb+srv://..." --out backup/

# MongoDB restore
mongorestore --uri "mongodb+srv://..." backup/
```

#### 2. Application Recovery

```bash
# Rollback to previous version
docker tag express-learning:latest express-learning:broken
docker tag express-learning:previous express-learning:latest
docker-compose up -d
```

---

## 📝 Post-Deployment Checklist

- [ ] **Health Checks**: All health endpoints responding correctly
- [ ] **SSL Certificate**: HTTPS working and certificate valid
- [ ] **Database**: Connection established and queries working
- [ ] **Authentication**: Login flow working for all user types
- [ ] **API Endpoints**: All endpoints responding correctly
- [ ] **Logging**: Application logs being written correctly
- [ ] **Monitoring**: Monitoring systems receiving data
- [ ] **Backups**: Database backup procedures configured
- [ ] **Super Admin**: Super admin creation and management working
- [ ] **Security**: Security headers and rate limiting active

---

_This deployment guide ensures secure, scalable, and maintainable production deployments. Always test deployment procedures in staging environment first._
