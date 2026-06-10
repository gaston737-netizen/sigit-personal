import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { interconsultasTable } from "./interconsultas";

export const adjuntosTable = pgTable("adjuntos", {
  id: serial("id").primaryKey(),
  interconsultaId: integer("interconsulta_id").notNull().references(() => interconsultasTable.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(),
  ruta: text("ruta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdjuntoSchema = createInsertSchema(adjuntosTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAdjunto = z.infer<typeof insertAdjuntoSchema>;
export type Adjunto = typeof adjuntosTable.$inferSelect;
