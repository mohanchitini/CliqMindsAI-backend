const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/env');
require('./config/database');

const app = express();
require('dotenv').config();
console.log("Loaded BACKEND_API_KEY:", process.env.BACKEND_API_KEY);

// API Key Middleware
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key || key !== process.env.BACKEND_API_KEY) {
    return res.status(403).json({
      error: "Unauthorized - Invalid API Key"
    });
  }

  next();
});


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CliqSync AI Backend',
    timestamp: new Date().toISOString()
  });
});

const authRoutes = require('./routes/auth');
const trelloRoutes = require('./routes/trello');
const webhookRoutes = require('./routes/webhooks');
const aiRoutes = require('./routes/ai');
const eventRoutes = require('./routes/events');

app.use('/auth', authRoutes);
app.use('/api/trello', trelloRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CliqSync AI Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
