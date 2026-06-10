import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interconsultasTable = pgTable("interconsultas", {
  id: serial("id").primaryKey(),
  prontuario: text("prontuario").notNull(),
  dni: text("dni"),
  apellidoNombre: text("apellido_nombre").notNull(),
  pabellon: text("pabellon"),
  complejoUnidad: text("complejo_unidad"),
  especialidad: text("especialidad").notNull(),
  medicoSolicitante: text("medico_solicitante"),
  prioridad: text("prioridad").notNull().default("normal"),
  motivo: text("motivo"),
  estado: text("estado").notNull().default("pendiente"),
  fechaInterconsulta: text("fecha_interconsulta").notNull(),
  expedienteGde: text("expediente_gde"),
  fechaEnvio: text("fecha_envio"),
  fechaTurno: text("fecha_turno"),
  fechaAtencion: text("fecha_atencion"),
  ultimoMovimiento: text("ultimo_movimiento"),
  alerta: text("alerta").notNull().default("none"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInterconsultaSchema = createInsertSchema(interconsultasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInterconsulta = z.infer<typeof insertInterconsultaSchema>;
export type Interconsulta = typeof interconsultasTable.$inferSelect;
