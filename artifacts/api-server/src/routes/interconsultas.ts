import { Router } from "express";
import { db } from "@workspace/db";
import { interconsultasTable, observacionesTable, adjuntosTable } from "@workspace/db";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import {
  ListInterconsultasQueryParams,
  CreateInterconsultaBody,
  GetInterconsultaParams,
  UpdateInterconsultaParams,
  UpdateInterconsultaBody,
  DeleteInterconsultaParams,
  CambiarEstadoParams,
  CambiarEstadoBody,
  CreateObservacionParams,
  CreateObservacionBody,
  ListObservacionesParams,
  ListAdjuntosParams,
  CreateAdjuntoParams,
  CreateAdjuntoBody,
} from "@workspace/api-zod";

const router = Router();

function calcDiasTranscurridos(fechaStr: string): number {
  try {
    const parts = fechaStr.split("/");
    let fecha: Date;
    if (parts.length === 3) {
      fecha = new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
    } else {
      fecha = new Date(fechaStr);
    }
    const now = new Date();
    const diff = Math.floor((now.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

function calcAlerta(dias: number): string {
  if (dias >= 90) return "roja";
  if (dias >= 60) return "naranja";
  if (dias >= 30) return "amarilla";
  return "none";
}

function formatInterconsulta(row: typeof interconsultasTable.$inferSelect) {
  const dias = calcDiasTranscurridos(row.fechaInterconsulta);
  return {
    id: row.id,
    prontuario: row.prontuario,
    dni: row.dni,
    apellidoNombre: row.apellidoNombre,
    pabellon: row.pabellon,
    complejoUnidad: row.complejoUnidad,
    especialidad: row.especialidad,
    medicoSolicitante: row.medicoSolicitante,
    prioridad: row.prioridad,
    motivo: row.motivo,
    estado: row.estado,
    fechaInterconsulta: row.fechaInterconsulta,
    expedienteGde: row.expedienteGde,
    fechaEnvio: row.fechaEnvio,
    fechaTurno: row.fechaTurno,
    fechaAtencion: row.fechaAtencion,
    ultimoMovimiento: row.ultimoMovimiento,
    diasTranscurridos: dias,
    alerta: calcAlerta(dias),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// List interconsultas
router.get("/interconsultas", async (req, res) => {
  const parsed = ListInterconsultasQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let rows = await db.select().from(interconsultasTable).orderBy(desc(interconsultasTable.createdAt));

  let results = rows.map(formatInterconsulta);

  if (params.estado) {
    results = results.filter((r) => r.estado === params.estado);
  }
  if (params.especialidad) {
    results = results.filter((r) => r.especialidad.toLowerCase().includes(params.especialidad!.toLowerCase()));
  }
  if (params.alerta) {
    results = results.filter((r) => r.alerta === params.alerta);
  }
  if (params.search && params.searchBy) {
    const s = params.search.toLowerCase();
    results = results.filter((r) => {
      switch (params.searchBy) {
        case "prontuario": return r.prontuario.toLowerCase().includes(s);
        case "apellido": return r.apellidoNombre.toLowerCase().includes(s);
        case "dni": return (r.dni ?? "").toLowerCase().includes(s);
        case "expediente": return (r.expedienteGde ?? "").toLowerCase().includes(s);
        default: return r.apellidoNombre.toLowerCase().includes(s);
      }
    });
  } else if (params.search) {
    const s = params.search.toLowerCase();
    results = results.filter((r) =>
      r.apellidoNombre.toLowerCase().includes(s) ||
      r.prontuario.toLowerCase().includes(s) ||
      (r.dni ?? "").toLowerCase().includes(s)
    );
  }

  res.json(results);
});

// Create interconsulta
router.post("/interconsultas", async (req, res) => {
  const parsed = CreateInterconsultaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { observacionInicial, ...data } = parsed.data;
  const now = new Date();
  const [row] = await db
    .insert(interconsultasTable)
    .values({
      ...data,
      estado: "pendiente",
      alerta: "none",
      updatedAt: now,
    })
    .returning();

  if (observacionInicial) {
    const today = now.toLocaleDateString("es-AR");
    await db.insert(observacionesTable).values({
      interconsultaId: row.id,
      texto: observacionInicial,
      fecha: today,
    });
  }

  res.status(201).json(formatInterconsulta(row));
});

// Get single interconsulta
router.get("/interconsultas/:id", async (req, res) => {
  const parsed = GetInterconsultaParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(interconsultasTable)
    .where(eq(interconsultasTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const observaciones = await db
    .select()
    .from(observacionesTable)
    .where(eq(observacionesTable.interconsultaId, row.id))
    .orderBy(observacionesTable.fecha);

  const adjuntos = await db
    .select()
    .from(adjuntosTable)
    .where(eq(adjuntosTable.interconsultaId, row.id));

  const formatted = formatInterconsulta(row);
  res.json({
    ...formatted,
    observaciones: observaciones.map((o) => ({
      id: o.id,
      interconsultaId: o.interconsultaId,
      texto: o.texto,
      fecha: o.fecha,
      createdAt: o.createdAt.toISOString(),
    })),
    adjuntos: adjuntos.map((a) => ({
      id: a.id,
      interconsultaId: a.interconsultaId,
      nombre: a.nombre,
      tipo: a.tipo,
      ruta: a.ruta,
      createdAt: a.createdAt.toISOString(),
    })),
  });
});

// Update interconsulta
router.patch("/interconsultas/:id", async (req, res) => {
  const paramParsed = UpdateInterconsultaParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateInterconsultaBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const now = new Date();
  const [row] = await db
    .update(interconsultasTable)
    .set({ ...bodyParsed.data, updatedAt: now })
    .where(eq(interconsultasTable.id, paramParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatInterconsulta(row));
});

// Delete interconsulta
router.delete("/interconsultas/:id", async (req, res) => {
  const parsed = DeleteInterconsultaParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(interconsultasTable).where(eq(interconsultasTable.id, parsed.data.id));
  res.status(204).send();
});

// Change estado
router.patch("/interconsultas/:id/estado", async (req, res) => {
  const paramParsed = CambiarEstadoParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CambiarEstadoBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { estado, observacion } = bodyParsed.data;
  const now = new Date();
  const today = now.toLocaleDateString("es-AR");

  const [row] = await db
    .update(interconsultasTable)
    .set({
      estado,
      ultimoMovimiento: today,
      updatedAt: now,
    })
    .where(eq(interconsultasTable.id, paramParsed.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (observacion) {
    await db.insert(observacionesTable).values({
      interconsultaId: row.id,
      texto: observacion,
      fecha: today,
    });
  }

  res.json(formatInterconsulta(row));
});

// List observaciones
router.get("/interconsultas/:id/observaciones", async (req, res) => {
  const parsed = ListObservacionesParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select()
    .from(observacionesTable)
    .where(eq(observacionesTable.interconsultaId, parsed.data.id))
    .orderBy(observacionesTable.fecha);

  res.json(rows.map((o) => ({
    id: o.id,
    interconsultaId: o.interconsultaId,
    texto: o.texto,
    fecha: o.fecha,
    createdAt: o.createdAt.toISOString(),
  })));
});

// Create observacion
router.post("/interconsultas/:id/observaciones", async (req, res) => {
  const paramParsed = CreateObservacionParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CreateObservacionBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const now = new Date();
  const today = now.toLocaleDateString("es-AR");
  const [o] = await db
    .insert(observacionesTable)
    .values({
      interconsultaId: paramParsed.data.id,
      texto: bodyParsed.data.texto,
      fecha: today,
    })
    .returning();

  // Update ultimo_movimiento
  await db
    .update(interconsultasTable)
    .set({ ultimoMovimiento: today, updatedAt: now })
    .where(eq(interconsultasTable.id, paramParsed.data.id));

  res.status(201).json({
    id: o.id,
    interconsultaId: o.interconsultaId,
    texto: o.texto,
    fecha: o.fecha,
    createdAt: o.createdAt.toISOString(),
  });
});

// List adjuntos
router.get("/interconsultas/:id/adjuntos", async (req, res) => {
  const parsed = ListAdjuntosParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select()
    .from(adjuntosTable)
    .where(eq(adjuntosTable.interconsultaId, parsed.data.id));

  res.json(rows.map((a) => ({
    id: a.id,
    interconsultaId: a.interconsultaId,
    nombre: a.nombre,
    tipo: a.tipo,
    ruta: a.ruta,
    createdAt: a.createdAt.toISOString(),
  })));
});

// Create adjunto
router.post("/interconsultas/:id/adjuntos", async (req, res) => {
  const paramParsed = CreateAdjuntoParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CreateAdjuntoBody.safeParse(req.body);
  if (!paramParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [a] = await db
    .insert(adjuntosTable)
    .values({
      interconsultaId: paramParsed.data.id,
      nombre: bodyParsed.data.nombre,
      tipo: bodyParsed.data.tipo,
      ruta: bodyParsed.data.ruta,
    })
    .returning();

  res.status(201).json({
    id: a.id,
    interconsultaId: a.interconsultaId,
    nombre: a.nombre,
    tipo: a.tipo,
    ruta: a.ruta,
    createdAt: a.createdAt.toISOString(),
  });
});

export default router;
