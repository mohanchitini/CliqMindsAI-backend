# Cliq Minds Backend

## Overview

This is a backend service for "Cliq Minds" - an application that manages users, activity logs, analytics, and settings. The system provides a RESTful API for CRUD operations and includes real-time dashboard statistics. The repository also contains a separate Stage 1 backend implementation for "CliqSync AI" - a Trello integration project with AI-powered features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Primary Application (Cliq Minds):**
- **Runtime**: Node.js with TypeScript (ES2022 target, ESNext modules)
- **Framework**: Express.js 5.x
- **Database ORM**: Drizzle ORM 0.44.7
- **Database Driver**: Neon Serverless (Postgres-compatible)
- **Schema Validation**: Zod 4.x with drizzle-zod integration
- **Development**: tsx for TypeScript execution
- **WebSocket Support**: ws 8.x library

**Secondary Application (CliqSync AI):**
- **Runtime**: Node.js (JavaScript/CommonJS)
- **Framework**: Express.js 4.x
- **Database**: SQLite with better-sqlite3
- **HTTP Client**: Axios
- **AI Integration**: OpenAI GPT-3.5-turbo

### Project Structure

The repository contains two distinct applications:

**Main Application (`/server`, `/shared`):**
```
server/
  ├── index.ts          # Express server entry point
  ├── routes.ts         # API route definitions
  └── storage.ts        # Database abstraction layer

shared/
  └── schema.ts         # Drizzle schema definitions
```

**CliqSync AI (`/CliqSyncAI`):**
```
CliqSyncAI/
  ├── server.js         # Express entry point with API key middleware
  ├── config/           # Database and environment configuration
  ├── controllers/      # Request handlers (auth, trello, webhook, AI)
  ├── models/           # Database models (User, TrelloEvent)
  ├── routes/           # Route definitions
  ├── services/         # Business logic (TrelloService, AIService)
  └── utils/            # Helper functions
```

### Database Architecture

**Primary Application Schema:**
- **users**: User management with email uniqueness, role-based access (user/admin), and status tracking (active/inactive)
- **activity_logs**: Audit trail linking user actions with descriptions and timestamps
- **analytics**: Time-series metrics storage for tracking system-wide statistics
- **settings**: Configuration key-value pairs with integer values

All tables use PostgreSQL via Neon serverless with auto-incrementing serial IDs and timestamp tracking.

**CliqSync AI Schema (SQLite):**
- **users**: OAuth token storage (Trello access/refresh tokens with expiration)
- **trello_events**: Webhook event logging with full payload JSON storage

### API Design

**RESTful Endpoints (Primary App):**
- `GET /api/health` - Health check endpoint
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user with validation
- `PATCH /api/users/:id` - Update user
- Additional CRUD endpoints for activity logs, analytics, and settings

**Authentication & Authorization:**
- CliqSync AI uses API key middleware (`x-api-key` header) for all requests
- Primary app has no authentication layer (intended for internal/trusted network use)
- User creation automatically logs activity via activity_logs table

### Data Validation Strategy

Uses Zod for runtime type validation:
- Schema definitions in `shared/schema.ts` using `drizzle-zod` for automatic schema generation
- Insert schemas omit auto-generated fields (id, timestamps)
- Validation errors converted to human-readable messages via `zod-validation-error`
- 400 status codes returned for validation failures with detailed error messages

### Storage Abstraction Layer

The `storage.ts` module provides a typed interface (`IStorage`) abstracting database operations:
- Separates business logic from database implementation details
- Returns promises for all async operations
- Includes specialized methods like `getDashboardStats()` for aggregated queries
- Supports pagination via limit parameters on log queries

### WebSocket Configuration

Neon serverless requires explicit WebSocket constructor configuration:
```typescript
neonConfig.webSocketConstructor = ws;
```
This enables the Postgres driver to work in environments without native WebSocket support.

### Error Handling Patterns

- Try-catch blocks in all route handlers
- Generic 500 errors for internal failures
- 404 errors for missing resources
- Validation errors return specific Zod error messages
- Database connection failures throw at startup (fail-fast principle)

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - Neon Postgres connection string (mandatory for primary app)
- `PORT` - Server port (defaults to 5000)
- `BACKEND_API_KEY` - API key for CliqSync AI authentication
- `TRELLO_KEY`, `TRELLO_SECRET` - Trello OAuth credentials
- `OPENAI_API_KEY` - OpenAI API access
- `TRELLO_REDIRECT_URI` - OAuth callback URL

## External Dependencies

### Database Services

**Neon Serverless Postgres:**
- Serverless Postgres database via `@neondatabase/serverless`
- WebSocket-based connection pooling
- Auto-scaling infrastructure
- Requires DATABASE_URL environment variable

**SQLite (CliqSync AI only):**
- Embedded database via `better-sqlite3`
- File-based storage (`database.sqlite`)
- Synchronous API for simplicity

### Third-Party APIs

**Trello API (CliqSync AI):**
- OAuth 2.0 authentication flow with never-expiring tokens
- RESTful API for boards, lists, cards operations
- Webhook integration for real-time event notifications
- Rate limiting handled by Axios retry logic

**OpenAI API (CliqSync AI):**
- GPT-3.5-turbo model for AI features
- Used for card summarization, subtask generation, and priority classification
- Temperature parameter tuning (default 0.7)
- Error handling for API failures and quota limits

### NPM Packages

**Core Dependencies:**
- `express` - Web framework (v5 for primary, v4 for CliqSync)
- `drizzle-orm` - Type-safe ORM with query builder
- `drizzle-kit` - Schema migrations and introspection
- `zod` - Runtime type validation
- `cors` - Cross-origin resource sharing middleware
- `ws` - WebSocket library for Neon compatibility

**Development Tools:**
- `tsx` - TypeScript execution without compilation
- `typescript` - Type checking and definitions
- Type definition packages (`@types/*`)

**CliqSync AI Specific:**
- `axios` - HTTP client for external API calls
- `body-parser` - Request body parsing middleware
- `dotenv` - Environment variable management
- `better-sqlite3` - Native SQLite bindings

### Security Considerations

**CliqSync AI is Stage 1 (Development Only):**
- Implements API key authentication but NOT production-ready
- OAuth state parameter for CSRF protection with 10-minute session timeout
- Requires integration with Zoho Cliq authentication (Stage 2) before production
- Current limitation: Shared API key instead of per-user session authentication
- See SECURITY.md for detailed production integration requirements

### Integration Points

**Trello Webhooks:**
- HEAD request support for webhook verification
- Event filtering for card-related actions only
- Full payload storage for audit and replay capabilities
- Automatic event type classification

**AI Service Integration:**
- Stateless API design for OpenAI calls
- Message-based prompt engineering
- Temperature parameter exposed for creativity control
- Error propagation with descriptive messages