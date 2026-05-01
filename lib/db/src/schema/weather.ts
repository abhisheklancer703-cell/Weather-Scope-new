import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  temperature: real("temperature").notNull(),
  rainfall: real("rainfall").notNull(),
  humidity: real("humidity").notNull(),
});

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  firstAccessAt: timestamp("first_access_at"),
  status: text("status").default("active").notNull(),
});

export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => appUsers.id),
  accessTime: timestamp("access_time").defaultNow().notNull(),
  actionType: text("action_type").notNull(),
  ipAddress: text("ip_address"),
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({ id: true });
export const insertAppUserSchema = createInsertSchema(appUsers).omit({ id: true, registeredAt: true, firstAccessAt: true });
export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({ id: true, accessTime: true });

export type WeatherRecord = typeof weatherData.$inferSelect;
export type InsertWeatherRecord = z.infer<typeof insertWeatherDataSchema>;

export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = z.infer<typeof insertAppUserSchema>;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;
