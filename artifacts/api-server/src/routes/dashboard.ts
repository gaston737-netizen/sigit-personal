import { Router } from "express";
import { db } from "@workspace/db";
import { interconsultasTable, configuracionTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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
    return Math.max(0, Math.floor((now.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)));
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

// Dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  const rows = await db.select().from(interconsultasTable);

  const activeRows = rows.filter((r) => r.estado !== "cerrado");
  const pendientes = activeRows.filter((r) => r.estado === "pendiente").length;
  const conTurno = activeRows.filter((r) => r.estado === "con_turno").length;
  const atendidos = activeRows.filter((r) => r.estado === "atendido").length;

  const rowsWithDias = rows
    .filter((r) => r.estado !== "cerrado" && r.estado !== "atendido")
    .map((r) => ({
      ...r,
      dias: calcDiasTranscurridos(r.fechaInterconsulta),
    }));

  const criticos = rowsWithDias.filter((r) => r.dias >= 90).length;

  const alertasActivas = rowsWithDias
    .filter((r) => r.dias >= 90)
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      prontuario: r.prontuario,
      apellidoNombre: r.apellidoNombre,
      especialidad: r.especialidad,
      diasTranscurridos: r.dias,
      alerta: calcAlerta(r.dias),
      estado: r.estado,
    }));

  const today = new Date().toLocaleDateString("es-AR");
  res.json({ fecha: today, pendientes, conTurno, atendidos, criticos, alertasActivas });
});

// Alertas
router.get("/alertas", async (req, res) => {
  const rows = await db.select().from(interconsultasTable);

  const alertas = rows
    .filter((r) => r.estado !== "cerrado" && r.estado !== "atendido")
    .map((r) => ({
      id: r.id,
      prontuario: r.prontuario,
      apellidoNombre: r.apellidoNombre,
      especialidad: r.especialidad,
      diasTranscurridos: calcDiasTranscurridos(r.fechaInterconsulta),
      alerta: "",
      estado: r.estado,
    }))
    .map((r) => ({ ...r, alerta: calcAlerta(r.diasTranscurridos) }))
    .filter((r) => r.diasTranscurridos >= 90)
    .sort((a, b) => b.diasTranscurridos - a.diasTranscurridos);

  res.json(alertas);
});

// Seguimiento diario
router.get("/seguimiento-diario", async (req, res) => {
  const rows = await db
    .select()
    .from(interconsultasTable)
    .where(eq(interconsultasTable.estado, "pendiente"));

  const enriched = rows.map((r) => {
    const dias = calcDiasTranscurridos(r.fechaInterconsulta);
    return {
      id: r.id,
      prontuario: r.prontuario,
      dni: r.dni,
      apellidoNombre: r.apellidoNombre,
      pabellon: r.pabellon,
      complejoUnidad: r.complejoUnidad,
      especialidad: r.especialidad,
      medicoSolicitante: r.medicoSolicitante,
      prioridad: r.prioridad,
      motivo: r.motivo,
      estado: r.estado,
      fechaInterconsulta: r.fechaInterconsulta,
      expedienteGde: r.expedienteGde,
      fechaEnvio: r.fechaEnvio,
      fechaTurno: r.fechaTurno,
      fechaAtencion: r.fechaAtencion,
      ultimoMovimiento: r.ultimoMovimiento,
      diasTranscurridos: dias,
      alerta: calcAlerta(dias),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  });

  res.json({
    sin30dias: enriched.filter((r) => r.diasTranscurridos >= 30 && r.diasTranscurridos < 60),
    sin60dias: enriched.filter((r) => r.diasTranscurridos >= 60 && r.diasTranscurridos < 90),
    sin90dias: enriched.filter((r) => r.diasTranscurridos >= 90),
  });
});

// Reportes
router.get("/reportes", async (req, res) => {
  const mes = Number(req.query.mes);
  const anio = Number(req.query.anio);

  if (!mes || !anio) {
    res.status(400).json({ error: "mes y anio son requeridos" });
    return;
  }

  const rows = await db.select().from(interconsultasTable);

  const inMonth = rows.filter((r) => {
    try {
      const parts = r.fechaInterconsulta.split("/");
      if (parts.length === 3) {
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        return m === mes && y === anio;
      }
      return false;
    } catch {
      return false;
    }
  });

  const pendientes = inMonth.filter((r) => r.estado === "pendiente").length;
  const turnosOtorgados = inMonth.filter((r) => r.estado === "con_turno" || r.fechaTurno).length;
  const atendidos = inMonth.filter((r) => r.estado === "atendido").length;
  const criticos = inMonth.filter((r) => calcDiasTranscurridos(r.fechaInterconsulta) >= 90).length;

  const especialidadMap: Record<string, number> = {};
  for (const r of inMonth) {
    especialidadMap[r.especialidad] = (especialidadMap[r.especialidad] ?? 0) + 1;
  }
  const porEspecialidad = Object.entries(especialidadMap).map(([especialidad, total]) => ({ especialidad, total }));

  res.json({ mes, anio, pendientes, turnosOtorgados, atendidos, criticos, porEspecialidad });
});

export default router;
