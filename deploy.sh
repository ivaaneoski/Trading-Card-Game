#!/bin/bash
# Deployment script for TCG Arena

set -e

echo "🚀 TCG Arena Deployment"
echo "======================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker not found${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose not found${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js not found${NC}"; exit 1; }

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Load environment
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Database (optional if using docker-compose)
# DATABASE_URL=postgresql://user:password@host:5432/tcg_game

# Redis (optional if using docker-compose)
# REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
    echo -e "${YELLOW}⚠️  Edit .env with your AWS credentials and secrets${NC}"
    echo -e "${YELLOW}Then run this script again${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Run migrations (if local DB)
if [ "$1" = "local" ]; then
    echo -e "\n${YELLOW}Running database migrations...${NC}"
    npm run db:migrate
fi

# Build
echo -e "\n${YELLOW}Building project...${NC}"
npm run build

# Docker setup
if [ "$1" = "docker" ]; then
    echo -e "\n${YELLOW}Starting Docker Compose stack...${NC}"
    docker-compose up -d
    
    echo -e "\n${GREEN}✓ Services started${NC}"
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost"
    echo "  Backend: http://localhost:3000"
    echo "  Postgres: localhost:5432"
    echo "  Redis: localhost:6379"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
fi

# Kubernetes deployment
if [ "$1" = "k8s" ]; then
    echo -e "\n${YELLOW}Deploying to Kubernetes...${NC}"
    
    if [ -z "$DOCKER_REGISTRY" ]; then
        echo -e "${RED}Error: DOCKER_REGISTRY not set${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Building and pushing Docker images...${NC}"
    docker build --target backend-runtime -t $DOCKER_REGISTRY/tcg-backend:latest .
    docker push $DOCKER_REGISTRY/tcg-backend:latest
    
    docker build --target frontend-runtime -t $DOCKER_REGISTRY/tcg-frontend:latest .
    docker push $DOCKER_REGISTRY/tcg-frontend:latest
    
    echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
    kubectl apply -f k8s/deployment.yaml
    
    echo -e "${GREEN}✓ Kubernetes deployment complete${NC}"
    echo ""
    echo "Monitor deployment:"
    echo "  kubectl get pods -n production"
    echo "  kubectl logs -f deployment/tcg-backend -n production"
fi

# Local development
if [ "$1" = "" ] || [ "$1" = "dev" ]; then
    echo -e "\n${GREEN}✓ Ready for local development${NC}"
    echo ""
    echo "Start development servers:"
    echo "  npm run dev"
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend: http://localhost:3000"
fi

echo -e "\n${GREEN}✓ Setup complete!${NC}"
