// server/storage.ts

import sqlite3 from "sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  users,
  activityLogs,
  analytics,
  settings,
  InsertUser,
  User,
  InsertActivityLog,
  ActivityLog,
  InsertAnalytics,
  Analytics,
  InsertSettings,
  Settings,
} from "../shared/schema";

import { eq, desc, sql } from "drizzle-orm";

const dbFile = process.env.DATABASE_FILE || "database.sqlite";

// Initialize SQLite (NO COMPILATION REQUIRED)
sqlite3.verbose();
const sqlite = new sqlite3.Database(dbFile);

// Drizzle connection
const db = drizzle(sqlite);

export class Storage {
  // USERS
  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt)).all();
  }

  async getUserById(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async createUser(user: InsertUser): Promise<User> {
    return db.insert(users).values(user).returning().get();
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    return db.update(users).set(user).where(eq(users.id, id)).returning().get();
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = db.delete(users).where(eq(users.id, id)).run();
    return result.changes > 0;
  }

  // ACTIVITY LOGS
  async getActivityLogs(limit = 10): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit)
      .all();
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    return db.insert(activityLogs).values(log).returning().get();
  }

  async getActivityLogById(id: number): Promise<ActivityLog | undefined> {
    return db.select().from(activityLogs).where(eq(activityLogs.id, id)).get();
  }

  async updateActivityLog(
    id: number,
    log: Partial<InsertActivityLog>
  ): Promise<ActivityLog | undefined> {
    return db.update(activityLogs).set(log).where(eq(activityLogs.id, id)).returning().get();
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    return db.delete(activityLogs).where(eq(activityLogs.id, id)).run().changes > 0;
  }

  // ANALYTICS
  async getAnalytics(): Promise<Analytics[]> {
    return db.select().from(analytics).orderBy(desc(analytics.date)).all();
  }

  async getAnalyticsById(id: number): Promise<Analytics | undefined> {
    return db.select().from(analytics).where(eq(analytics.id, id)).get();
  }

  async createAnalytics(data: InsertAnalytics): Promise<Analytics> {
    return db.insert(analytics).values(data).returning().get();
  }

  async updateAnalytics(
    id: number,
    data: Partial<InsertAnalytics>
  ): Promise<Analytics | undefined> {
    return db.update(analytics).set(data).where(eq(analytics.id, id)).returning().get();
  }

  async deleteAnalytics(id: number): Promise<boolean> {
    return db.delete(analytics).where(eq(analytics.id, id)).run().changes > 0;
  }

  // DASHBOARD
  async getDashboardStats() {
    const totalUsers =
      db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;

    const activeUsers =
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.status, "active"))
        .get()?.count ?? 0;

    const totalActivity =
      db.select({ count: sql<number>`count(*)` }).from(activityLogs).get()?.count ?? 0;

    return {
      totalUsers,
      activeUsers,
      totalActivity,
      growthRate: 12.5,
    };
  }

  // SETTINGS
  async getSettings(): Promise<Settings[]> {
    return db.select().from(settings).orderBy(settings.key).all();
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    return db.select().from(settings).where(eq(settings.key, key)).get();
  }

  async createSetting(setting: InsertSettings): Promise<Settings> {
    return db.insert(settings).values(setting).returning().get();
  }

  async updateSetting(
    key: string,
    value: string
  ): Promise<Settings | undefined> {
    return db
      .update(settings)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(settings.key, key))
      .returning()
      .get();
  }

  async deleteSetting(key: string): Promise<boolean> {
    return db.delete(settings).where(eq(settings.key, key)).run().changes > 0;
  }
}

export const storage = new Storage();
