import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { interconsultasTable } from "./interconsultas";

export const observacionesTable = pgTable("observaciones", {
  id: serial("id").primaryKey(),
  interconsultaId: integer("interconsulta_id").notNull().references(() => interconsultasTable.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  fecha: text("fecha").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertObservacionSchema = createInsertSchema(observacionesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertObservacion = z.infer<typeof insertObservacionSchema>;
export type Observacion = typeof observacionesTable.$inferSelect;
