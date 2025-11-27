# CliqSync AI Backend - Project Information

## Project Overview
This is the **Stage-1 backend** for CliqSync AI, an AI-Powered Trello Integration for Zoho Cliq.

**Current Status**: Stage 1 Complete - Backend API and services built

**Important**: This is a development backend built in isolation. It requires integration with Zoho Cliq authentication (Stage 2+) before production deployment.

## Architecture

### Technology Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **HTTP Client**: Axios
- **AI**: OpenAI GPT-3.5-turbo

### Project Structure
```
├── config/          - Database and environment configuration
├── controllers/     - Request handlers for all routes
├── models/          - Database models (User, TrelloEvent)
├── routes/          - API route definitions
├── services/        - Business logic (Trello API, AI)
├── utils/           - Helper functions
└── server.js        - Application entry point
```

### Key Features Implemented
1. ✅ Trello OAuth 2.0 flow with token verification
2. ✅ Complete Trello API wrapper (boards, lists, cards)
3. ✅ Webhook endpoint for real-time Trello events
4. ✅ OpenAI integration for AI features
5. ✅ REST API for all operations
6. ✅ SQLite database for token and event storage

## API Endpoints

### Authentication
- `GET /auth/trello/start` - Initiate OAuth (requires userId and apiKey)
- `GET /auth/trello/callback` - OAuth callback handler
- `POST /auth/trello/complete` - Complete OAuth with token verification

### Trello Operations
- `GET /api/trello/boards` - Get user's Trello boards
- `GET /api/trello/lists?board=ID` - Get lists for a board
- `GET /api/trello/cards?list=ID` - Get cards for a list
- `GET /api/trello/cards/:cardId` - Get card details
- `POST /api/trello/cards` - Create a new card
- `PATCH /api/trello/cards/:cardId` - Update a card
- `POST /api/trello/cards/:cardId/move` - Move card to different list

### AI Features
- `POST /api/ai/summarize` - AI-powered card summarization
- `POST /api/ai/subtasks` - Generate subtasks from card
- `POST /api/ai/priority` - Classify card priority
- `POST /api/ai/chat-to-task` - Extract task from chat message

### Webhooks & Events
- `POST /webhooks/trello` - Receive Trello webhook events
- `GET /api/events/recent` - Get recent Trello events

### Health Check
- `GET /api/health` - Service health status

## Environment Variables

Required:
- `TRELLO_KEY` - Trello API key
- `TRELLO_SECRET` - Trello OAuth secret (currently unused in implicit flow)
- `TRELLO_REDIRECT_URI` - OAuth callback URL
- `OPENAI_API_KEY` - OpenAI API key

Optional:
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database path (default: ./database.sqlite)
- `JWT_SECRET` - API key for OAuth initiation (development only)

## Database Schema

### users table
- Stores Trello OAuth tokens per userId
- Fields: userId, trelloAccessToken, trelloRefreshToken, expiresAt

### trello_events table
- Stores webhook events from Trello
- Fields: eventType, cardId, cardName, listId, boardId, payload, createdAt

## Security Considerations

**IMPORTANT**: See SECURITY.md for critical security limitations and production requirements.

Key points:
- Current OAuth implementation uses shared API key (not production-ready)
- Requires integration with proper session-based authentication
- All Trello tokens are verified before storage
- State parameter prevents CSRF attacks
- Sessions expire after 10 minutes

## Development Workflow

1. Server runs on port 3000
2. Health check: `curl http://localhost:3000/api/health`
3. Workflow: "Start Backend Server" - runs `node server.js`

## Next Steps (Stage 2+)

1. Build Zoho Cliq extension
2. Integrate proper user authentication
3. Replace API key with session-based auth
4. Implement webhook verification
5. Add rate limiting and production hardening
6. Deploy to production environment

## Recent Changes

- 2024-11-25: Initial Stage-1 backend implementation complete
  - OAuth flow with token verification
  - Trello API service layer
  - AI integration with OpenAI
  - Webhook event handling
  - Comprehensive documentation and security notes

## User Preferences

None specified yet.
