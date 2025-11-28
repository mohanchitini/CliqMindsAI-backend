import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "CliqMinds AI Backend",
    time: new Date().toISOString(),
  });
});

// API KEY MIDDLEWARE
app.use((req, res, next) => {
  if (req.path === "/api/health") return next();

  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.BACKEND_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
});

// ROUTES
app.use("/api/events", (req, res) =>
  res.json({ message: "Events Route Working" })
);

// PORT + HOST
const PORT = process.env.PORT || 3000;

// ⭐ SHOW CLICKABLE URL HERE ⭐
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
