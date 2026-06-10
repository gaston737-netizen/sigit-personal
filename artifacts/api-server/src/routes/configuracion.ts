import { Router } from "express";
import { db } from "@workspace/db";
import { configuracionTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateConfiguracionBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateConfig() {
  const rows = await db.select().from(configuracionTable);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(configuracionTable).values({}).returning();
  return created;
}

router.get("/configuracion", async (req, res) => {
  const config = await getOrCreateConfig();
  res.json(config);
});

router.put("/configuracion", async (req, res) => {
  const parsed = UpdateConfiguracionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const existing = await getOrCreateConfig();
  const [updated] = await db
    .update(configuracionTable)
    .set(parsed.data)
    .where(eq(configuracionTable.id, existing.id))
    .returning();

  res.json(updated ?? existing);
});

export default router;
