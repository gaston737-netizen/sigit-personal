import { useLocation } from "wouter";
import { useGetAlertas, getGetAlertasQueryKey } from "@workspace/api-client-react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Alertas() {
  const [, setLocation] = useLocation();
  const { data: alertas, isLoading } = useGetAlertas({
    query: { queryKey: getGetAlertasQueryKey() },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Interconsultas Críticas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Casos con más de 90 días sin resolución, ordenados de mayor a menor demora
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : alertas && alertas.length > 0 ? (
            <table className="w-full text-sm" data-testid="tabla-alertas">
              <thead>
                <tr className="border-b bg-red-50">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Prontuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Especialidad</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Días</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b last:border-0 hover:bg-red-50/50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/ficha/${a.id}`)}
                    data-testid={`row-alerta-${a.id}`}
                  >
                    <td className="py-4 px-4 font-mono text-xs">{a.prontuario}</td>
                    <td className="py-4 px-4 font-medium">{a.apellidoNombre}</td>
                    <td className="py-4 px-4 text-muted-foreground">{a.especialidad}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-14 h-8 rounded-full bg-red-100 border border-red-300 font-bold text-red-700 text-sm">
                        {a.diasTranscurridos}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                        {a.estado === "pendiente" ? "Pendiente" : a.estado === "con_turno" ? "Con Turno" : a.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center text-muted-foreground" data-testid="alertas-empty">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Sin alertas críticas</p>
              <p className="text-sm mt-1">No hay interconsultas con más de 90 días de demora</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
