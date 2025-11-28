const crypto = require('crypto');
const User = require('../models/User');
const config = require('../../config/env');

const authSessions = new Map();
const SESSION_TIMEOUT = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [state, data] of authSessions.entries()) {
    if (now - data.timestamp > SESSION_TIMEOUT) {
      authSessions.delete(state);
    }
  }
}, 60 * 1000);

exports.startTrelloAuth = (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      error: 'userId parameter is required' 
    });
  }

  const state = crypto.randomBytes(32).toString('hex');
  authSessions.set(state, { userId, timestamp: Date.now() });

  const redirectUri = `${config.trello.redirectUri}?state=${state}`;
  const authUrl = `https://trello.com/1/authorize?` +
    `expiration=never&` +
    `name=CliqSync AI&` +
    `scope=read,write&` +
    `response_type=token&` +
    `key=${config.trello.key}&` +
    `return_url=${encodeURIComponent(redirectUri)}`;

  res.redirect(authUrl);
};

exports.trelloCallback = async (req, res) => {
  const { state } = req.query;

  res.send(`
    <html>
      <head>
        <title>Connecting to Trello...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 50px;
            text-align: center;
            background: #f5f5f5;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success { color: #27ae60; }
          .error { color: #e74c3c; }
          .loading { color: #3498db; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="loading" id="status">⏳ Processing...</h1>
          <p id="message">Please wait while we connect your Trello account.</p>
        </div>
        <script>
          (function() {
            const urlParams = new URLSearchParams(window.location.search);
            const state = urlParams.get('state');
            const hash = window.location.hash.substring(1);
            const hashParams = new URLSearchParams(hash);
            const token = hashParams.get('token');

            if (!state) {
              document.getElementById('status').className = 'error';
              document.getElementById('status').textContent = '✗ Authentication Failed';
              document.getElementById('message').textContent = 'Invalid authentication session.';
              return;
            }

            if (!token) {
              document.getElementById('status').className = 'error';
              document.getElementById('status').textContent = '✗ Authentication Failed';
              document.getElementById('message').textContent = 'No token received from Trello.';
              return;
            }

            fetch('/auth/trello/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token, state })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                document.getElementById('status').className = 'success';
                document.getElementById('status').textContent = '✓ Successfully Connected!';
                document.getElementById('message').textContent = 'Your Trello account has been linked to CliqSync AI. You can now close this window.';
              } else {
                document.getElementById('status').className = 'error';
                document.getElementById('status').textContent = '✗ Authentication Failed';
                document.getElementById('message').textContent = data.error || 'An error occurred.';
              }
            })
            .catch(error => {
              document.getElementById('status').className = 'error';
              document.getElementById('status').textContent = '✗ Error';
              document.getElementById('message').textContent = 'Failed to complete authentication: ' + error.message;
            });
          })();
        </script>
      </body>
    </html>
  `);
};

exports.completeAuth = async (req, res) => {
  try {
    const { token, state } = req.body;

    if (!token || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and state are required' 
      });
    }

    const sessionData = authSessions.get(state);
    
    if (!sessionData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired authentication session' 
      });
    }

    const now = Date.now();
    if (now - sessionData.timestamp > SESSION_TIMEOUT) {
      authSessions.delete(state);
      return res.status(400).json({ 
        success: false, 
        error: 'Authentication session expired' 
      });
    }

    try {
      const axios = require('axios');
      const verifyResponse = await axios.get('https://api.trello.com/1/members/me', {
        params: {
          key: config.trello.key,
          token: token,
          fields: 'id,username'
        },
        timeout: 5000
      });

      if (!verifyResponse.data || !verifyResponse.data.id) {
        authSessions.delete(state);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid Trello token' 
        });
      }

    } catch (verifyError) {
      authSessions.delete(state);
      console.error('Token verification failed:', verifyError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to verify Trello token' 
      });
    }

    authSessions.delete(state);
    User.upsert(sessionData.userId, token);

    res.json({ 
      success: true, 
      message: 'Authentication successful',
      userId: sessionData.userId
    });
  } catch (error) {
    console.error('Auth completion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};