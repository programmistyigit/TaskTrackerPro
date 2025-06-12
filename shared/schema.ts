import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  avatarUrl: text("avatar_url"),
  status: text("status").$type<"online" | "offline">().default("offline"),
  lastActive: timestamp("last_active"),
  completedTasks: integer("completed_tasks").default(0),
  pendingTasks: integer("pending_tasks").default(0),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  sender: text("sender").$type<"admin" | "user">().notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isTask: boolean("is_task").default(false),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").$type<"phone" | "sms" | "twoFactor">().notNull(),
  status: text("status").$type<"pending" | "completed" | "failed">().default("pending"),
  data: text("data"), // JSON string for task-specific data
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastActive: true,
  completedTasks: true,
  pendingTasks: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
