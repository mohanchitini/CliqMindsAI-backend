import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
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

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  getActivityLogById(id: number): Promise<ActivityLog | undefined>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  updateActivityLog(id: number, log: Partial<InsertActivityLog>): Promise<ActivityLog | undefined>;
  deleteActivityLog(id: number): Promise<boolean>;
  
  getAnalytics(): Promise<Analytics[]>;
  getAnalyticsById(id: number): Promise<Analytics | undefined>;
  createAnalytics(data: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: number, data: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
  deleteAnalytics(id: number): Promise<boolean>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalActivity: number;
    growthRate: number;
  }>;

  getSettings(): Promise<Settings[]>;
  getSettingByKey(key: string): Promise<Settings | undefined>;
  createSetting(setting: InsertSettings): Promise<Settings>;
  updateSetting(key: string, value: string): Promise<Settings | undefined>;
  deleteSetting(key: string): Promise<boolean>;
}

class Storage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogById(id: number): Promise<ActivityLog | undefined> {
    const [log] = await db.select().from(activityLogs).where(eq(activityLogs.id, id));
    return log;
  }

  async updateActivityLog(id: number, log: Partial<InsertActivityLog>): Promise<ActivityLog | undefined> {
    const [updatedLog] = await db
      .update(activityLogs)
      .set(log)
      .where(eq(activityLogs.id, id))
      .returning();
    return updatedLog;
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    const result = await db.delete(activityLogs).where(eq(activityLogs.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics).orderBy(desc(analytics.date));
  }

  async getAnalyticsById(id: number): Promise<Analytics | undefined> {
    const [data] = await db.select().from(analytics).where(eq(analytics.id, id));
    return data;
  }

  async createAnalytics(data: InsertAnalytics): Promise<Analytics> {
    const [newData] = await db.insert(analytics).values(data).returning();
    return newData;
  }

  async updateAnalytics(id: number, data: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const [updatedData] = await db
      .update(analytics)
      .set(data)
      .where(eq(analytics.id, id))
      .returning();
    return updatedData;
  }

  async deleteAnalytics(id: number): Promise<boolean> {
    const result = await db.delete(analytics).where(eq(analytics.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDashboardStats() {
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, "active"));
    
    const totalActivityResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLogs);

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
      totalActivity: totalActivityResult[0]?.count || 0,
      growthRate: 12.5,
    };
  }

  async getSettings(): Promise<Settings[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async getSettingByKey(key: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async createSetting(setting: InsertSettings): Promise<Settings> {
    const [newSetting] = await db.insert(settings).values(setting).returning();
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<Settings | undefined> {
    const [updatedSetting] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return updatedSetting;
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(settings).where(eq(settings.key, key));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new Storage();
