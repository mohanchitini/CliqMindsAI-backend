import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  users,
  activityLogs,
  analytics,
  InsertUser,
  User,
  InsertActivityLog,
  ActivityLog,
  InsertAnalytics,
  Analytics,
} from "@shared/schema";
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
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  getAnalytics(): Promise<Analytics[]>;
  createAnalytics(data: InsertAnalytics): Promise<Analytics>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalActivity: number;
    growthRate: number;
  }>;
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

  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics).orderBy(desc(analytics.date));
  }

  async createAnalytics(data: InsertAnalytics): Promise<Analytics> {
    const [newData] = await db.insert(analytics).values(data).returning();
    return newData;
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
}

export const storage = new Storage();
