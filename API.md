# TCG Arena - API Reference

## Base URL
- **Local Dev**: `http://localhost:3000`
- **Production**: Configure via environment

## Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Tokens obtained from `/auth/login` or `/auth/register`.

---

## Auth Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123...",
    "username": "player1",
    "email": "player1@example.com",
    "elo": 1200
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "SecurePass123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123...",
    "username": "player1",
    "email": "player1@example.com",
    "elo": 1200
  }
}
```

---

## User Endpoints

### Get Profile
```
GET /users/:username

Response 200:
{
  "id": "clx123...",
  "username": "player1",
  "avatar": "https://...",
  "bio": "Competitive player",
  "elo": 1400,
  "wins": 45,
  "losses": 12,
  "totalGames": 57,
  "createdAt": "2024-01-01T12:00:00Z"
}
```

### Get Leaderboard
```
GET /users
Authorization: Bearer <TOKEN>

Query Parameters:
  limit: 50 (default)

Response 200:
[
  {
    "id": "clx123...",
    "username": "topplayer",
    "elo": 2100,
    "wins": 200,
    "losses": 50,
    "totalGames": 250
  },
  ...
]
```

---

## Card Endpoints

### Create Card
```
POST /cards
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Fire Dragon",
  "imageUrl": "https://s3.amazonaws.com/...",
  "cost": 5,
  "attack": 7,
  "defense": 4,
  "rarity": "epic",
  "abilities": ["firebreath", "flying"]
}

Response 201:
{
  "id": "card_123...",
  "ownerId": "user_123...",
  "name": "Fire Dragon",
  "imageUrl": "https://s3.amazonaws.com/...",
  "cost": 5,
  "attack": 7,
  "defense": 4,
  "abilities": "[\"firebreath\", \"flying\"]",
  "rarity": "epic",
  "version": 1,
  "isApproved": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get My Cards
```
GET /cards/my
Authorization: Bearer <TOKEN>

Response 200:
[
  {
    "id": "card_123...",
    "name": "Fire Dragon",
    "imageUrl": "https://...",
    "cost": 5,
    "attack": 7,
    "defense": 4,
    "rarity": "epic",
    "isApproved": true
  },
  ...
]
```

### Get Public Cards
```
GET /cards

Query Parameters:
  limit: 100 (default)

Response 200:
[
  {
    "id": "card_123...",
    "name": "Fire Dragon",
    "imageUrl": "https://...",
    "cost": 5,
    "attack": 7,
    "defense": 4,
    "rarity": "epic"
  },
  ...
]
```

---

## Deck Endpoints

### Create Deck
```
POST /decks
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Fire Control",
  "description": "Aggressive fire-based deck",
  "cards": [
    { "cardId": "card_123...", "quantity": 3 },
    { "cardId": "card_456...", "quantity": 2 },
    ...
  ]
}

Response 201:
{
  "id": "deck_123...",
  "ownerId": "user_123...",
  "name": "Fire Control",
  "description": "Aggressive fire-based deck",
  "checksum": "sha256hash...",
  "isPublic": false,
  "cards": [
    {
      "id": "deckcard_123...",
      "cardId": "card_123...",
      "quantity": 3,
      "card": { ... }
    }
  ],
  "createdAt": "2024-01-15T11:00:00Z"
}

Validation:
- Max 30 cards total
- All cards must belong to user
- Max 3 copies per card
```

### Get My Decks
```
GET /decks/my
Authorization: Bearer <TOKEN>

Response 200:
[
  {
    "id": "deck_123...",
    "name": "Fire Control",
    "checksum": "sha256hash...",
    "cards": [ ... ]
  },
  ...
]
```

### Validate Deck
```
POST /decks/validate
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "deckId": "deck_123..."
}

Response 200:
{
  "valid": true,
  "checksum": "sha256hash..."
}

Response 200 (Invalid):
{
  "valid": false,
  "checksum": "newsha256hash..."
}
```

---

## Match Endpoints

### Get Match History
```
GET /matches/history
Authorization: Bearer <TOKEN>

Query Parameters:
  limit: 50 (default)

Response 200:
[
  {
    "id": "match_123...",
    "player1Id": "user_123...",
    "player2Id": "user_456...",
    "status": "completed",
    "winner": "user_123...",
    "eloChange1": 32,
    "eloChange2": -32,
    "startedAt": "2024-01-15T12:00:00Z",
    "endedAt": "2024-01-15T12:15:00Z"
  },
  ...
]
```

### Forfeit Match
```
POST /matches/forfeit
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "matchId": "match_123..."
}

Response 200:
{
  "forfeited": true,
  "opponent": "user_456..."
}
```

---

## Upload Endpoints

### Request Presigned URL
```
POST /uploads/request-upload
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "fileName": "my-card.png",
  "contentType": "image/png"
}

Response 200:
{
  "uploadUrl": "https://s3.amazonaws.com/...?AWSAccessKeyId=...&Signature=...",
  "key": "cards/user_123.../1234567890-abc123-my-card.png",
  "expiresIn": 300
}

Allowed Content-Types:
- image/png
- image/jpeg
- image/webp

Constraints:
- File size: Max 5MB
- Expires in: 5 minutes
```

### Confirm Upload
```
POST /uploads/confirm-upload
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "key": "cards/user_123.../1234567890-abc123-my-card.png"
}

Response 200:
{
  "imageUrl": "https://s3.amazonaws.com/.../my-card.png",
  "key": "cards/user_123.../1234567890-abc123-my-card.png"
}

Validation:
- File exists in S3
- File size <= 5MB
- Content-Type matches original request
```

---

## WebSocket Events (Socket.IO)

### Connection
```
Namespace: /game
Event: connect
```

### Queue Events

#### Join Queue
```
emit('join_queue', {
  userId: "user_123...",
  deckId: "deck_123...",
  queueType: "ranked" | "unranked",
  elo: 1400
})

on('queue_joined', {
  queueType: "ranked",
  position: 1
})
```

#### Leave Queue
```
emit('leave_queue', {
  userId: "user_123..."
})

on('queue_left')
```

### Match Events

#### Match Started
```
on('match_started', {
  matchId: "match_123...",
  players: [
    { id: "user_123...", name: "Player1" },
    { id: "user_456...", name: "Player2" }
  ],
  gameState: {
    turn: 1,
    currentPlayer: "user_123...",
    players: [
      {
        id: "user_123...",
        hp: 20,
        mana: 1,
        hand: 3,
        board: []
      },
      {
        id: "user_456...",
        hp: 20,
        mana: 1,
        hand: 3,
        board: []
      }
    ]
  }
})
```

#### Player Action
```
emit('player_action', {
  matchId: "match_123...",
  userId: "user_123...",
  moveType: "play_card" | "attack" | "ability" | "pass",
  payload: {
    // For play_card:
    cardInstanceId: "...",
    slot: 0,
    
    // For attack:
    attackerSlot: 0,
    targetSlot: 1 | -1 (direct)
    
    // For ability:
    abilityId: "...",
    targetSlot: 1
    
    // For pass:
    (empty)
  }
})
```

#### State Update
```
on('state_update', {
  turn: 2,
  currentPlayer: "user_456...",
  players: [
    {
      id: "user_123...",
      hp: 18,
      mana: 1,
      hand: 2,
      board: [
        {
          cardId: "card_123...",
          attack: 5,
          defense: 3,
          currentHp: 3
        }
      ]
    },
    ...
  ]
})
```

#### Match Ended
```
on('match_ended', {
  winner: "user_123..."
})
```

#### Action Error
```
on('action_error', {
  error: "Not your turn" | "Invalid move" | "Not enough mana"
})
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request data",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Not your resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

Per-user limits:
- Auth endpoints: 5 requests/minute
- Card creation: 10 requests/minute
- Move submission: 100 requests/minute
- General API: 100 requests/minute

Status Code: 429 Too Many Requests

---

## Pagination

List endpoints support pagination:
```
GET /users?limit=50&offset=0
```

---

## Timestamps

All timestamps are ISO 8601 format: `2024-01-15T12:00:00Z`

---

## Example Flow

1. **Register/Login**
   ```
   POST /auth/register → accessToken
   ```

2. **Upload Card Image**
   ```
   POST /uploads/request-upload → presignedUrl
   PUT presignedUrl (to S3)
   POST /uploads/confirm-upload → imageUrl
   ```

3. **Create Card**
   ```
   POST /cards (with imageUrl) → card
   ```

4. **Create Deck**
   ```
   POST /decks (with card IDs) → deck
   ```

5. **Join Queue**
   ```
   emit('join_queue', { userId, deckId, queueType, elo })
   on('match_started') → matchId
   ```

6. **Play Match**
   ```
   emit('player_action', { matchId, moveType, payload })
   on('state_update') → gameState
   on('match_ended') → winner
   ```

7. **Check History**
   ```
   GET /matches/history → matches with ELO changes
   ```

---

For more details, see [README.md](README.md)
