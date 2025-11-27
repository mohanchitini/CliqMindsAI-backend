# Security Considerations for CliqSync AI Backend

## ⚠️ CRITICAL WARNING - Stage 1 Implementation Status

**THIS BACKEND IS NOT PRODUCTION-READY AS-IS**

This is a **Stage 1 backend** built in isolation for development and testing purposes only. It requires proper authentication integration (Stage 2+) before production deployment.

### Known Security Limitations

🔴 **CRITICAL**: The OAuth flow currently has the following limitation:
- The `/auth/trello/start` endpoint uses a shared API key instead of per-user session authentication
- This means anyone with the API key can initiate OAuth for any userId
- While tokens are verified with Trello before storage, this does not prevent token substitution attacks
- **Do NOT use this in production without implementing proper session-based authentication**

### Current Security Measures (Insufficient for Production)

The following measures are implemented but do NOT make this production-ready:

1. **State Parameter CSRF Protection**: Cryptographically secure state parameter
2. **Session Timeout**: Authentication sessions expire after 10 minutes  
3. **Token Verification**: All Trello tokens are verified against Trello's API before storage
4. **API Key Protection**: Shared API key requirement (weak - not per-user authentication)

### Why This Approach for Stage 1?

This backend is designed to be integrated with a Zoho Cliq extension (Stage 2+) that will provide:
- Per-user authentication
- Authenticated user sessions
- Secure userId binding

Stage 1 focuses on building the core backend functionality (Trello API, webhooks, AI) in isolation before integration.

## Production Integration Requirements

When integrating this backend with the Zoho Cliq extension (Stage 2+), the following changes **MUST** be implemented:

### 1. Authenticated Sessions

Replace the API key mechanism with proper authenticated sessions:

```javascript
// Instead of passing userId as a query parameter:
GET /auth/trello/start?userId=USER_123&apiKey=SECRET

// Use authenticated session middleware:
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));

// Extract userId from authenticated session:
exports.startTrelloAuth = (req, res) => {
  const userId = req.session.userId; // From authenticated session
  // ... rest of OAuth flow
};
```

### 2. Session Binding

Ensure the OAuth callback validates that the user completing the flow is the same user who initiated it:

```javascript
// Store session ID with state:
authSessions.set(state, { 
  userId, 
  sessionId: req.sessionID,
  timestamp: Date.now() 
});

// Validate session ID in callback:
if (sessionData.sessionId !== req.sessionID) {
  return res.status(403).json({ error: 'Session mismatch' });
}
```

### 3. Additional Security Measures

#### For Production Deployment:

1. **HTTPS Only**: 
   - Enable `secure: true` for all cookies
   - Use HTTPS for all endpoints
   - Update `TRELLO_REDIRECT_URI` to use HTTPS

2. **Rate Limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // limit each IP to 5 requests per windowMs
   });
   
   app.use('/auth/', authLimiter);
   ```

3. **CORS Configuration**:
   ```javascript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS.split(','),
     credentials: true
   }));
   ```

4. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use parameterized queries (already implemented)

5. **Secure Headers**:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

6. **Token Rotation**:
   - Implement token refresh mechanism
   - Rotate tokens periodically
   - Revoke tokens on logout

7. **Audit Logging**:
   - Log all authentication attempts
   - Log all API calls with timestamps
   - Monitor for suspicious activity

## Environment Variables Security

**Never commit `.env` files to version control**

Required environment variables for production:

```bash
# Strong, unique secrets
JWT_SECRET=<strong-random-secret-256-bits>
SESSION_SECRET=<different-strong-random-secret>

# Trello credentials (keep secret)
TRELLO_KEY=<from-trello-app-key>
TRELLO_SECRET=<from-trello>
TRELLO_REDIRECT_URI=https://your-domain.com/auth/trello/callback

# OpenAI (keep secret)
OPENAI_API_KEY=<from-openai>

# Database (use encrypted connection in production)
DB_PATH=/secure/path/to/database.sqlite

# Production settings
NODE_ENV=production
PORT=3000
```

## Zoho Cliq Integration (Stage 2+)

When integrating with Zoho Cliq:

1. Use Zoho's authentication mechanism to identify users
2. Pass authenticated user context to backend API calls
3. Implement webhook verification for Zoho Cliq events
4. Use Zoho's secret management for API keys

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourcompany.com instead of using the issue tracker.

## Security Checklist for Production

- [ ] Replace API key auth with proper session-based authentication
- [ ] Implement session binding for OAuth flow
- [ ] Enable HTTPS everywhere
- [ ] Add rate limiting to all endpoints
- [ ] Configure CORS with specific allowed origins
- [ ] Add security headers (helmet.js)
- [ ] Implement audit logging
- [ ] Set up token rotation
- [ ] Review and update all secrets
- [ ] Enable database encryption at rest
- [ ] Set up monitoring and alerting
- [ ] Perform security audit/penetration testing
- [ ] Review and test error handling (no sensitive data in errors)
- [ ] Implement proper backup and disaster recovery
