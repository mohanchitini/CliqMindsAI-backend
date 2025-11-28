require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/env");
require("./config/database");

const app = express();

// --- PUBLIC ROUTES (NO API KEY) ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "CliqMinds AI Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// --- API KEY MIDDLEWARE ---
app.use((req, res, next) => {
  // Allow public routes
  if (req.path === "/api/health" || req.path === "/") {
    return next();
  }

  const key = req.headers["x-api-key"];

  if (!key || key !== process.env.BACKEND_API_KEY) {
    return res.status(403).json({
      error: "Unauthorized - Invalid API Key",
    });
  }

  next();
});

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- PROTECTED ROUTES ---
app.use("/auth", require("./routes/auth"));
app.use("/api/trello", require("./routes/trello"));
app.use("/webhooks", require("./routes/webhooks"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/events", require("./routes/events"));

// --- 404 HANDLER ---
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

// --- START SERVER ---
const PORT = process.env.PORT || config.port || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CliqMinds AI Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
