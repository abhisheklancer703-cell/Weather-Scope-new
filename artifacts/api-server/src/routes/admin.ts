import { Router } from "express";
import { db } from "@workspace/db";
import { appUsers, usageLogs, weatherData } from "@workspace/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

const router = Router();

function requireAdminSession(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any)?.isAdmin) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUsername && password === adminPassword) {
    (req.session as any).isAdmin = true;
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get("/admin/session", (req, res) => {
  res.json({ authenticated: !!(req.session as any)?.isAdmin });
});

router.post("/admin/change-password", requireAdminSession, (req, res) => {
  const { currentPassword } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (currentPassword !== adminPassword) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  res.json({ message: "Password validation successful. Update ADMIN_PASSWORD env var to persist." });
});

router.get("/admin/dashboard", requireAdminSession, async (req, res) => {
  try {
    const [allUsers, allLogs] = await Promise.all([
      db.select().from(appUsers),
      db.select().from(usageLogs),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisits = allLogs.filter((l) => new Date(l.accessTime) >= today).length;
    const activeUsers = allUsers.filter((u) => u.status === "active").length;
    const disabledUsers = allUsers.filter((u) => u.status !== "active").length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = allLogs.filter((l) => new Date(l.accessTime) >= thirtyDaysAgo);

    const usageByDate: Record<string, number> = {};
    for (const log of recentLogs) {
      const date = new Date(log.accessTime).toISOString().split("T")[0];
      usageByDate[date] = (usageByDate[date] || 0) + 1;
    }

    const usageByDateArr = Object.entries(usageByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalUsers: allUsers.length,
      totalVisits: allLogs.length,
      activeUsers,
      disabledUsers,
      todayVisits,
      usageByDate: usageByDateArr,
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats failed");
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/admin/users", requireAdminSession, async (req, res) => {
  try {
    const users = await db.select().from(appUsers).orderBy(appUsers.registeredAt);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Fetch users failed");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/admin/users/:id", requireAdminSession, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!["active", "disabled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    await db.update(appUsers).set({ status }).where(eq(appUsers.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Update user status failed");
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/admin/users/:id", requireAdminSession, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(usageLogs).where(eq(usageLogs.userId, id));
    await db.delete(appUsers).where(eq(appUsers.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete user failed");
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/admin/usage-logs", requireAdminSession, async (req, res) => {
  try {
    const logs = await db.select().from(usageLogs).orderBy(usageLogs.accessTime);
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Fetch usage logs failed");
    res.status(500).json({ error: "Failed to fetch usage logs" });
  }
});

router.get("/admin/export/users", requireAdminSession, async (req, res) => {
  try {
    const users = await db.select().from(appUsers);
    const csv = [
      "ID,Name,Email,Status,RegisteredAt,FirstAccessAt",
      ...users.map((u) =>
        `${u.id},${u.name.replace(/,/g, " ")},${u.email},${u.status},${new Date(u.registeredAt).toISOString()},${u.firstAccessAt ? new Date(u.firstAccessAt).toISOString() : ""}`
      ),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Export users failed");
    res.status(500).json({ error: "Failed to export" });
  }
});

router.get("/admin/export/logs", requireAdminSession, async (req, res) => {
  try {
    const logs = await db.select().from(usageLogs);
    const csv = [
      "ID,UserID,ActionType,AccessTime,IPAddress",
      ...logs.map((l) =>
        `${l.id},${l.userId},${l.actionType},${new Date(l.accessTime).toISOString()},${l.ipAddress || ""}`
      ),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=usage_logs.csv");
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Export logs failed");
    res.status(500).json({ error: "Failed to export" });
  }
});

export default router;
