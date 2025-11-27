# CliqSync AI Backend - Stage 1

AI-Powered Trello Integration Backend for Zoho Cliq

⚠️ **CRITICAL**: This is a Stage 1 backend for **development/testing only**. It requires proper authentication integration before production use. See [SECURITY.md](SECURITY.md) for details.

## 🚀 Features

- **Trello OAuth Authentication** - Secure OAuth flow for connecting Trello accounts
- **Trello API Integration** - Complete wrapper for Trello operations (boards, lists, cards)
- **Webhooks** - Real-time event tracking for Trello card changes
- **AI Integration** - OpenAI-powered features for card summarization, subtask generation, and priority classification
- **RESTful API** - Clean REST endpoints for all operations
- **SQLite Database** - Lightweight database for storing tokens and events

## 📁 Project Structure

```
cliqsync-ai-backend/
├── config/
│   ├── database.js       # Database initialization and schema
│   └── env.js            # Environment configuration
├── controllers/
│   ├── authController.js      # Trello OAuth handlers
│   ├── trelloController.js    # Trello API handlers
│   ├── webhookController.js   # Webhook handlers
│   └── aiController.js        # AI feature handlers
├── models/
│   ├── User.js           # User model (tokens)
│   └── TrelloEvent.js    # Event model
├── routes/
│   ├── auth.js           # Auth routes
│   ├── trello.js         # Trello API routes
│   ├── webhooks.js       # Webhook routes
│   ├── ai.js             # AI routes
│   └── events.js         # Event routes
├── services/
│   ├── TrelloService.js  # Trello API wrapper
│   └── AIService.js      # OpenAI integration
├── utils/
│   └── helpers.js        # Utility functions
├── server.js             # Entry point
├── package.json
├── .env.example
└── README.md
```

## 🛠️ Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `TRELLO_KEY` - Get from https://trello.com/app-key
- `TRELLO_SECRET` - OAuth secret from Trello
- `TRELLO_REDIRECT_URI` - Your callback URL (e.g., http://localhost:3000/auth/trello/callback)
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `PORT` - Server port (default: 3000)

3. **Start the Server**
```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
GET  /auth/trello/start?userId=USER_ID
GET  /auth/trello/callback
```

### Trello Operations
```
GET    /api/trello/boards
GET    /api/trello/lists?board=BOARD_ID
GET    /api/trello/cards?list=LIST_ID
GET    /api/trello/cards/:cardId
POST   /api/trello/cards
PATCH  /api/trello/cards/:cardId
POST   /api/trello/cards/:cardId/move
```

### Webhooks
```
POST   /webhooks/trello
HEAD   /webhooks/trello
```

### Events
```
GET    /api/events/recent?limit=20
```

### AI Features
```
POST   /api/ai/summarize
POST   /api/ai/subtasks
POST   /api/ai/priority
POST   /api/ai/chat-to-task
```

## 🔐 Authentication Flow

1. Direct user to: `GET /auth/trello/start?userId=YOUR_USER_ID&apiKey=YOUR_API_KEY` 
   - `userId` is required - identifies the user
   - `apiKey` is required when `JWT_SECRET` is set to a non-default value (can also be sent via `x-api-key` header)
2. User authorizes on Trello
3. User is redirected to callback page which extracts token from URL fragment
4. JavaScript on callback page sends token to server via `POST /auth/trello/complete`
5. Token is validated against Trello's API to ensure it's genuine
6. Token is stored in database with state verification
7. All subsequent API calls use this token

**Important Security Notes:**
- The `userId` parameter is required for authentication initiation
- API key protection prevents unauthorized OAuth initiation
- State parameter is used to prevent CSRF attacks
- All tokens are verified with Trello before storage
- Authentication sessions expire after 10 minutes
- Tokens are securely stored in the database
- **See [SECURITY.md](SECURITY.md) for production deployment requirements**

## 📝 Example API Calls

### Create a Card
```bash
curl -X POST http://localhost:3000/api/trello/cards \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "listId": "LIST_ID",
    "title": "New Task",
    "description": "Task description"
  }'
```

### Summarize a Card with AI
```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "cardId": "CARD_ID"
  }'
```

### Convert Chat to Task
```bash
curl -X POST http://localhost:3000/api/ai/chat-to-task \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "text": "We need to fix the login bug by tomorrow",
    "listId": "LIST_ID"
  }'
```

## 🔔 Setting Up Trello Webhooks

To receive real-time events from Trello, you need to create a webhook:

```bash
curl -X POST "https://api.trello.com/1/webhooks/" \
  -d "key=YOUR_TRELLO_KEY" \
  -d "token=YOUR_TRELLO_TOKEN" \
  -d "callbackURL=https://your-domain.com/webhooks/trello" \
  -d "idModel=YOUR_BOARD_ID"
```

## 🗄️ Database Schema

### Users Table
- `id` - Auto-increment primary key
- `userId` - Unique user identifier
- `trelloAccessToken` - Trello API token
- `trelloRefreshToken` - Refresh token (if available)
- `expiresAt` - Token expiration timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Trello Events Table
- `id` - Auto-increment primary key
- `eventType` - Type of event (e.g., createCard, updateCard)
- `cardId` - Card ID
- `cardName` - Card name
- `listId` - List ID
- `listName` - List name
- `boardId` - Board ID
- `boardName` - Board name
- `payload` - Full event payload (JSON)
- `createdAt` - Event timestamp

## 🧪 Testing

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "CliqSync AI Backend",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 User Identification

Include user ID in requests using one of these methods:
1. Query parameter: `?userId=USER_ID`
2. Header: `x-user-id: USER_ID`

Default user ID is `default-user` if not provided.

## 📦 Dependencies

- **express** - Web framework
- **dotenv** - Environment variables
- **axios** - HTTP client
- **better-sqlite3** - SQLite database
- **cors** - CORS middleware
- **body-parser** - Request body parsing

## 🚧 Stage 1 Scope

This is Stage 1 backend only. It includes:
- ✅ Trello OAuth
- ✅ Trello API wrapper
- ✅ Webhooks
- ✅ AI integration
- ✅ REST API endpoints

Not included in Stage 1:
- ❌ Zoho Cliq extension
- ❌ Zoho Deluge functions
- ❌ Zoho widgets
- ❌ Frontend UI

## 📄 License

MIT
