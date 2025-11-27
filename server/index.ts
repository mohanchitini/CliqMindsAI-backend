import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json());

registerRoutes(app);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cliq Minds Backend running on port ${PORT}`);
});
