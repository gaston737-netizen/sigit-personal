import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const configuracionTable = pgTable("configuracion", {
  id: serial("id").primaryKey(),
  diasAlertaAmarilla: integer("dias_alerta_amarilla").notNull().default(30),
  diasAlertaNaranja: integer("dias_alerta_naranja").notNull().default(60),
  diasAlertaRoja: integer("dias_alerta_roja").notNull().default(90),
  rutaAdjuntos: text("ruta_adjuntos").notNull().default("C:\\SIGIT\\Adjuntos"),
  rutaBackups: text("ruta_backups").notNull().default("C:\\SIGIT\\Backups"),
});

export const insertConfiguracionSchema = createInsertSchema(configuracionTable).omit({ id: true });
export type InsertConfiguracion = z.infer<typeof insertConfiguracionSchema>;
export type Configuracion = typeof configuracionTable.$inferSelect;
