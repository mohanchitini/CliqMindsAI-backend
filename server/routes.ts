import type { Express } from "express";
import { storage } from "./storage";
import { insertUserSchema, insertActivityLogSchema, insertAnalyticsSchema, insertSettingsSchema } from "../shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express) {
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const user = await storage.createUser(result.data);
      await storage.createActivityLog({
        userId: user.id,
        action: "user_created",
        description: `User ${user.name} was created`,
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const user = await storage.updateUser(id, result.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.createActivityLog({
        userId: user.id,
        action: "user_updated",
        description: `User ${user.name} was updated`,
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const deleted = await storage.deleteUser(id);
      if (deleted) {
        await storage.createActivityLog({
          userId: null,
          action: "user_deleted",
          description: `User ${user.name} was deleted`,
        });
        res.status(204).send();
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/activity-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const result = insertActivityLogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const log = await storage.createActivityLog(result.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });

  app.get("/api/activity-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.getActivityLogById(id);
      if (!log) {
        return res.status(404).json({ error: "Activity log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity log" });
    }
  });

  app.patch("/api/activity-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertActivityLogSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const log = await storage.updateActivityLog(id, result.data);
      if (!log) {
        return res.status(404).json({ error: "Activity log not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to update activity log" });
    }
  });

  app.delete("/api/activity-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteActivityLog(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Activity log not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete activity log" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const result = insertAnalyticsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const data = await storage.createAnalytics(result.data);
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to create analytics data" });
    }
  });

  app.get("/api/analytics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = await storage.getAnalyticsById(id);
      if (!data) {
        return res.status(404).json({ error: "Analytics data not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  app.patch("/api/analytics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertAnalyticsSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const data = await storage.updateAnalytics(id, result.data);
      if (!data) {
        return res.status(404).json({ error: "Analytics data not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to update analytics data" });
    }
  });

  app.delete("/api/analytics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAnalytics(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Analytics data not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete analytics data" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const result = insertSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const setting = await storage.createSetting(result.data);
      await storage.createActivityLog({
        userId: null,
        action: "setting_created",
        description: `Setting ${setting.key} was created`,
      });
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to create setting" });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      if (!value || typeof value !== "string") {
        return res.status(400).json({ error: "Value is required and must be a string" });
      }
      const setting = await storage.updateSetting(req.params.key, value);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      await storage.createActivityLog({
        userId: null,
        action: "setting_updated",
        description: `Setting ${setting.key} was updated`,
      });
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  app.delete("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      const deleted = await storage.deleteSetting(req.params.key);
      if (deleted) {
        await storage.createActivityLog({
          userId: null,
          action: "setting_deleted",
          description: `Setting ${setting.key} was deleted`,
        });
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Setting not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete setting" });
    }
  });
}
