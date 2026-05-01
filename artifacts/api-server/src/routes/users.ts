import { Router } from "express";
import { db } from "@workspace/db";
import { appUsers, usageLogs } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

router.post("/users/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data", issues: parsed.error.issues });
  }

  const { name, email } = parsed.data;

  try {
    const existing = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const [user] = await db
      .insert(appUsers)
      .values({
        name,
        email,
        status: "active",
        firstAccessAt: new Date(),
      })
      .returning();

    await db.insert(usageLogs).values({
      userId: user.id,
      actionType: "register",
      ipAddress: req.ip || null,
    });

    res.status(201).json(user);
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

export default router;
