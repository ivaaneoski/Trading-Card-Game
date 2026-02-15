# TCG Arena - File Index & Quick Reference

## 📍 Quick Navigation

### 📖 Documentation (Start Here)
- **[DELIVERY.md](DELIVERY.md)** - Executive summary & what you got
- **[README.md](README.md)** - Setup instructions & architecture
- **[API.md](API.md)** - Complete API reference
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Feature checklist & details

### 🚀 Getting Started
1. Read [DELIVERY.md](DELIVERY.md) (5 min)
2. Read [README.md](README.md) (10 min)
3. Run `deploy.sh` or `deploy.bat` (2 min)
4. Access http://localhost:5173

---

## 🏗️ Backend Structure

### Core Modules
| File | Purpose |
|------|---------|
| `apps/backend/src/main.ts` | Server entry point, Socket.IO setup |
| `apps/backend/src/app.module.ts` | NestJS root module |
| `apps/backend/prisma/schema.prisma` | Database schema (User, Card, Deck, Match, etc) |

### Authentication
| File | Purpose |
|------|---------|
| `apps/backend/src/auth/auth.service.ts` | Login, register, token validation |
| `apps/backend/src/auth/auth.controller.ts` | `/auth/*` endpoints |
| `apps/backend/src/auth/jwt.strategy.ts` | JWT Passport strategy |

### Game Features
| File | Purpose |
|------|---------|
| `apps/backend/src/game/game.engine.ts` | **Core game logic**: moves, validation, combat |
| `apps/backend/src/game/game.gateway.ts` | **WebSocket server**: queues, matchmaking, real-time |
| `apps/backend/src/game/game.types.ts` | GameState, Move, BoardCard types |
| `apps/backend/src/matches/matches.service.ts` | Match creation, history, ELO updates |
| `apps/backend/src/cards/cards.service.ts` | Card CRUD |
| `apps/backend/src/decks/decks.service.ts` | Deck creation, validation, checksums |
| `apps/backend/src/users/users.service.ts` | Profiles, leaderboards |
| `apps/backend/src/uploads/uploads.service.ts` | S3 presigned URLs |
| `apps/backend/src/health/health.controller.ts` | Kubernetes probes |

### Database
| File | Purpose |
|------|---------|
| `apps/backend/src/prisma/prisma.service.ts` | Prisma ORM wrapper |
| `apps/backend/prisma/migrations/` | Database migration history |

---

## 🎨 Frontend Structure

### Pages
| File | Purpose |
|------|---------|
| `apps/frontend/src/App.tsx` | Root component, routing |
| `apps/frontend/src/pages/Login.tsx` | Register/login UI |
| `apps/frontend/src/pages/Dashboard.tsx` | Main hub (play, cards, decks, profile) |
| `apps/frontend/src/pages/GameBoard.tsx` | **In-game UI**: board, hand, animations |

### Components
| File | Purpose |
|------|---------|
| `apps/frontend/src/components/CardEditor.tsx` | Create cards, image upload |
| `apps/frontend/src/components/DeckBuilder.tsx` | Build decks, card selection |

### Services
| File | Purpose |
|------|---------|
| `apps/frontend/src/api.ts` | Axios REST client |
| `apps/frontend/src/socket.ts` | Socket.IO WebSocket client |
| `apps/frontend/src/store.ts` | Zustand state management |

### Config
| File | Purpose |
|------|---------|
| `apps/frontend/vite.config.ts` | Vite build config |
| `apps/frontend/tailwind.config.js` | Tailwind CSS theme |
| `apps/frontend/tsconfig.json` | TypeScript config |

---

## 🔧 Infrastructure & Config

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Docker build (backend + frontend) |
| `docker-compose.yml` | Local development stack (postgres, redis, services) |
| `k8s/deployment.yaml` | Kubernetes manifests (3× backend, 2× frontend) |
| `.github/workflows/ci-cd.yml` | GitHub Actions pipeline (lint, build, deploy) |
| `package.json` | Monorepo root, workspace config |
| `tsconfig.json` | Shared TypeScript config |
| `.prettierrc` | Code formatting config |
| `.editorconfig` | Editor settings |
| `.gitignore` | Git ignore rules |

---

## 📦 Shared Code

| File | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Shared TypeScript types & constants |

---

## 🚀 Deployment Scripts

| File | Platform | Usage |
|------|----------|-------|
| `deploy.sh` | Linux/Mac | `./deploy.sh` (local dev) or `dev`, `docker`, `k8s` |
| `deploy.bat` | Windows | `deploy.bat` (local dev) |

---

## 📋 Config Files

| File | Purpose |
|------|---------|
| `apps/backend/.env.example` | Backend environment template |
| `apps/backend/.env.local` | Backend secrets (create from .env.example) |
| `apps/backend/nest-cli.json` | NestJS CLI config |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **[DELIVERY.md](DELIVERY.md)** | What you got, quick start, success criteria |
| **[README.md](README.md)** | Setup, architecture, features, troubleshooting |
| **[API.md](API.md)** | Complete REST & WebSocket API reference |
| **[IMPLEMENTATION.md](IMPLEMENTATION.md)** | Feature checklist, what's included/not included |
| **[INDEX.md](INDEX.md)** | This file—navigation guide |

---

## 🎯 Key Files by Role

### For Developers
- Start: `apps/backend/src/game/game.engine.ts` (core logic)
- Backend API: `apps/backend/src/*/controller.ts` files
- Frontend UI: `apps/frontend/src/pages/*.tsx`
- Types: `packages/shared/src/index.ts`

### For DevOps
- Deployment: `docker-compose.yml` (local) or `k8s/deployment.yaml` (production)
- CI/CD: `.github/workflows/ci-cd.yml`
- Docker: `Dockerfile`

### For Database
- Schema: `apps/backend/prisma/schema.prisma`
- Migrations: `apps/backend/prisma/migrations/`

### For Game Design
- Rules: `apps/backend/src/game/game.engine.ts` (turn logic)
- Card stats: `apps/backend/src/cards/` (validation ranges)
- Game types: `apps/backend/src/game/game.types.ts`

---

## 🔑 Critical Code Snippets

### Game Engine (Core Logic)
**File**: `apps/backend/src/game/game.engine.ts`
- `initializeGame()` - Create new match
- `executeMove()` - Validate and apply moves
- `validatePlayCard()` - Card play logic
- `validateAttack()` - Combat logic

### WebSocket Gateway (Real-Time)
**File**: `apps/backend/src/game/game.gateway.ts`
- `handleJoinQueue()` - Enter matchmaking
- `handlePlayerAction()` - Receive moves
- `startMatch()` - Initialize game
- `endMatch()` - Finish game, update ELO

### Game Board (UI)
**File**: `apps/frontend/src/pages/GameBoard.tsx`
- Opponent board, hand, mana display
- Action buttons (play, attack, pass)
- Real-time state updates

### Card Editor (Uploads)
**File**: `apps/frontend/src/components/CardEditor.tsx`
- Presigned URL request
- S3 upload
- Card creation

---

## 📊 Database Tables

View schema: `apps/backend/prisma/schema.prisma`

| Table | Purpose |
|-------|---------|
| `User` | Accounts, ELO, stats |
| `Card` | User-created cards |
| `Deck` | Card collections |
| `DeckCard` | Deck-card relationships |
| `Match` | Game sessions |
| `Move` | Turn history |
| `EloHistory` | Ranking timeline |
| `AuditLog` | Anti-cheat events |

---

## 🔗 API Routes

### REST API (Express)
| Endpoint | Purpose | File |
|----------|---------|------|
| `POST /auth/register` | Create account | `auth/auth.controller.ts` |
| `POST /auth/login` | Login | `auth/auth.controller.ts` |
| `GET /users/:username` | Get profile | `users/users.controller.ts` |
| `GET /users` | Leaderboard | `users/users.controller.ts` |
| `POST /cards` | Create card | `cards/cards.controller.ts` |
| `GET /cards/my` | My cards | `cards/cards.controller.ts` |
| `GET /cards` | Public cards | `cards/cards.controller.ts` |
| `POST /decks` | Create deck | `decks/decks.controller.ts` |
| `GET /decks/my` | My decks | `decks/decks.controller.ts` |
| `POST /decks/validate` | Verify deck | `decks/decks.controller.ts` |
| `GET /matches/history` | Match history | `matches/matches.controller.ts` |
| `POST /matches/forfeit` | Surrender | `matches/matches.controller.ts` |
| `POST /uploads/request-upload` | S3 presigned URL | `uploads/uploads.controller.ts` |
| `POST /uploads/confirm-upload` | Validate upload | `uploads/uploads.controller.ts` |
| `GET /health` | Health check | `health/health.controller.ts` |

### WebSocket (Socket.IO)
| Event | Direction | Purpose | File |
|-------|-----------|---------|------|
| `join_queue` | ← | Enter matchmaking | `game/game.gateway.ts` |
| `leave_queue` | ← | Exit queue | `game/game.gateway.ts` |
| `queue_joined` | → | Queue confirmed | `game/game.gateway.ts` |
| `match_started` | → | Game begins | `game/game.gateway.ts` |
| `player_action` | ← | Submit move | `game/game.gateway.ts` |
| `state_update` | → | Broadcast state | `game/game.gateway.ts` |
| `match_ended` | → | Game over | `game/game.gateway.ts` |
| `action_error` | → | Invalid move | `game/game.gateway.ts` |

---

## 🚀 Deployment Checklist

Before deploying, verify:
- [ ] `.env.local` configured (DB, Redis, AWS)
- [ ] AWS S3 bucket created & credentials set
- [ ] PostgreSQL 15+ ready
- [ ] Redis 7+ ready
- [ ] Node 20+ installed
- [ ] Docker installed (for Docker deployment)

---

## 📞 Quick Reference

**Start local dev**:
```bash
npm install && npm run db:migrate && npm run dev
```

**Run with Docker**:
```bash
docker-compose up
```

**Deploy to K8s**:
```bash
docker build -t tcg-backend:latest . && kubectl apply -f k8s/deployment.yaml
```

**Check logs**:
```bash
npm run dev            # Local
docker-compose logs -f # Docker
kubectl logs -f deployment/tcg-backend -n production # K8s
```

**Access app**:
```
Local dev: http://localhost:5173 (frontend) + :3000 (backend)
Docker:    http://localhost (frontend) + :3000 (backend)
K8s:       kubectl get svc tcg-frontend (get external IP)
```

---

## 📚 Additional Resources

- **TypeScript**: Strict mode, no `any` types
- **NestJS**: Modular architecture, dependency injection
- **Prisma**: Type-safe ORM, migrations
- **Socket.IO**: Real-time, Redis adapter for scaling
- **React**: Hooks, Zustand state
- **Tailwind CSS**: Utility-first, responsive
- **Framer Motion**: Smooth animations
- **Docker**: Multi-stage, optimized images
- **Kubernetes**: Horizontal scaling, health probes

---

**Everything is in this project. You have the complete, production-ready TCG game!** 🎮✨
