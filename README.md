# TCG Arena - Browser-Based Trading Card Game

Production-ready online TCG engine with real-time PvP, deck building, user-created cards, and ELO ranking.

## Stack

- **Backend**: NestJS + TypeScript, PostgreSQL, Socket.IO, Redis
- **Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion
- **Infra**: Docker, Kubernetes, GitHub Actions CI/CD
- **Storage**: AWS S3 (presigned uploads)
- **Real-time**: Socket.IO with Redis adapter (horizontal scaling)

## Features

- ✅ User registration/login (JWT auth)
- ✅ Card creation with image upload (presigned S3)
- ✅ Deck builder with validation
- ✅ Server-authoritative turn-based combat
- ✅ Ranked/unranked matchmaking + queues
- ✅ ELO ranking system
- ✅ Real-time PvP matches via WebSocket
- ✅ Anti-cheat validation (server-side move verification)
- ✅ Match replay logging
- ✅ Responsive mobile-first UI with animations
- ✅ Leaderboards & player profiles

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use docker-compose)
- Redis (or use docker-compose)
- AWS S3 bucket (for card images)

### Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp apps/backend/.env.example apps/backend/.env.local
# Edit .env.local with your database, Redis, and AWS credentials

# Run migrations
npm run db:migrate

# Start dev servers
npm run dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

### Docker Compose (Full Stack)

```bash
# Create .env file with AWS credentials
cat > .env << EOF
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
EOF

# Start all services
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend: http://localhost:3000
```

## Architecture

### Database Schema

- **User**: Account, ELO, stats
- **Card**: User-created cards with image, stats, abilities
- **Deck**: Collections of cards with validation checksum
- **Match**: Game sessions with replay data
- **Move**: Turn actions (server-validated)
- **EloHistory**: Ranking timeline
- **AuditLog**: Anti-cheat events

### Game Engine

Deterministic, server-authoritative turn-based system:
1. Players submit moves (client-side intent only)
2. Server validates card legality, mana, board state
3. Server applies move & broadcasts new state
4. Replay logged for anti-cheat analysis

### Real-Time Protocol

WebSocket events via Socket.IO:
- `join_queue`, `leave_queue` → matchmaking
- `match_started` → game initialization
- `player_action` → move submission
- `state_update` → broadcast game state
- `match_ended` → result + ELO update

### Security

- **Auth**: JWT (HS256) with refresh tokens
- **Uploads**: Presigned S3 URLs, content-type validation, size limits
- **Game Logic**: Server-authoritative, all moves validated server-side
- **Replay**: Checksummed game logs for fraud detection
- **Rate Limiting**: Per-player move rate limits (prevent spam)

## API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Login, get JWT

### Users
- `GET /users/:username` - Public profile
- `GET /users` - Leaderboard (top 100)

### Cards
- `POST /cards` - Create card
- `GET /cards/my` - My cards
- `GET /cards` - Public cards

### Decks
- `POST /decks` - Create deck
- `GET /decks/my` - My decks
- `POST /decks/validate` - Verify deck integrity

### Matches
- `GET /matches/history` - Match history
- `POST /matches/forfeit` - Surrender

### Uploads
- `POST /uploads/request-upload` - Get presigned URL
- `POST /uploads/confirm-upload` - Validate & approve

## Development

### Project Structure

```
tcg-game/
├── apps/
│   ├── backend/           # NestJS server
│   │   ├── src/
│   │   │   ├── auth/      # Authentication
│   │   │   ├── users/     # User profiles
│   │   │   ├── cards/     # Card CRUD
│   │   │   ├── decks/     # Deck management
│   │   │   ├── matches/   # Match history
│   │   │   ├── game/      # Game engine + WebSocket gateway
│   │   │   ├── uploads/   # S3 uploads
│   │   │   └── prisma/    # DB service
│   │   └── prisma/        # Schema & migrations
│   └── frontend/          # React + Vite app
│       ├── src/
│       │   ├── pages/     # Login, Dashboard, GameBoard
│       │   ├── components/# CardEditor, DeckBuilder
│       │   ├── api.ts     # Axios client
│       │   ├── socket.ts  # Socket.IO client
│       │   └── store.ts   # Zustand state
│       └── index.html
├── packages/
│   └── shared/            # Shared TypeScript types
├── k8s/                   # Kubernetes manifests
├── docker-compose.yml
├── Dockerfile
└── .github/workflows/     # GitHub Actions CI/CD
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
docker build --target backend-runtime -t tcg-backend:latest .
docker build --target frontend-runtime -t tcg-frontend:latest .
```

## Deployment

### Kubernetes

```bash
# Set up cluster secrets
kubectl create secret generic tcg-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=jwt-secret="..." \
  --from-literal=aws-access-key="..." \
  --from-literal=aws-secret-key="..." \
  -n production

# Deploy
kubectl apply -f k8s/deployment.yaml
```

### Environment Variables

**Backend** (`.env.local`):
```
DATABASE_URL=postgresql://user:pass@host:5432/tcg_game
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=tcg-game-cards
NODE_ENV=production
PORT=3000
```

## Performance & Scaling

- **Horizontal scaling**: Socket.IO + Redis adapter (pub/sub across instances)
- **Game state**: Redis cache for active matches (fast lookups)
- **Database**: Connection pooling, indexed queries for leaderboards
- **Frontend**: Code-splitting, lazy loading, service worker (PWA ready)
- **CDN**: S3 for card images, Cloudfront optional

## Anti-Cheat

1. **Move Validation**: All actions validated server-side against current game state
2. **Card Checksums**: Deck integrity verified before match
3. **Replay Logging**: Full move history stored + checksummed
4. **Rate Limits**: Max moves per second per player
5. **Anomaly Detection**: Flag suspicious patterns (rapid moves, invalid sequences)

## Monitoring

- **Logs**: Structured logging to stdout (Kubernetes friendly)
- **Errors**: Sentry integration ready (add SDK)
- **Metrics**: Prometheus-ready (add `/metrics` endpoint)
- **Traces**: OpenTelemetry ready (add instrumentation)

## Future Enhancements

- [ ] Abilities system (more card effects)
- [ ] Seasonal passes & battle passes
- [ ] Tournament brackets
- [ ] Trading system (player-to-player)
- [ ] Mobile app (React Native)
- [ ] Advanced replays (video playback)
- [ ] Guilds & social features
- [ ] In-game shop (cosmetics)

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact dev@tcg-arena.com
