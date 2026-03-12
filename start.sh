#!/bin/bash
set -e

echo "🛑 Stopping any running containers..."
docker-compose down --remove-orphans

echo "🚀 Building with provenance disabled to prevent hangs..."
# CRITICAL: These variables disable the metadata attestation that causes the "resolving provenance" hang on macOS
# We removed DOCKER_DEFAULT_PLATFORM to let it run natively (ARM64 on M1/M2/M3) which is much faster.
export BUILDX_NO_DEFAULT_ATTESTATIONS=1
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Force rebuild with no cache to ensure fresh config
docker-compose build --no-cache

echo "✅ Starting services..."
docker-compose up -d

echo "🎉 Done! Application is running."
echo "👉 Frontend: http://localhost:3000"
echo "👉 Backend: http://localhost:8001/docs"
