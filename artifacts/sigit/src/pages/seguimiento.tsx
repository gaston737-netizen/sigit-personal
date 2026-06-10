import { useLocation } from "wouter";
import { useGetSeguimientoDiario, getGetSeguimientoDiarioQueryKey } from "@workspace/api-client-react";
import { Activity, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function CasoRow({ caso, onVer }: { caso: any; onVer: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/20 transition-colors border-b last:border-0" data-testid={`row-seguimiento-${caso.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{caso.apellidoNombre}</span>
          <span className="text-xs text-muted-foreground font-mono">#{caso.prontuario}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{caso.especialidad}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <span className={`text-sm font-bold tabular-nums ${caso.diasTranscurridos >= 90 ? "text-red-600" : caso.diasTranscurridos >= 60 ? "text-orange-600" : "text-yellow-600"}`}>
          {caso.diasTranscurridos}d
        </span>
        <Button size="sm" variant="ghost" onClick={onVer} className="gap-1.5 h-7 text-xs" data-testid={`button-ver-${caso.id}`}>
          <Eye className="w-3.5 h-3.5" />
          Ver
        </Button>
      </div>
    </div>
  );
}

function GrupoCard({ title, casos, color, onVer }: { title: string; casos: any[]; color: string; onVer: (id: number) => void }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted rounded-full px-2 py-0.5">{casos.length} caso{casos.length !== 1 ? "s" : ""}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {casos.length > 0 ? (
          casos.map((c) => <CasoRow key={c.id} caso={c} onVer={() => onVer(c.id)} />)
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground italic">Sin casos en este rango</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Seguimiento() {
  const [, setLocation] = useLocation();
  const { data, isLoading, refetch } = useGetSeguimientoDiario({
    query: { queryKey: getGetSeguimientoDiarioQueryKey() },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            Seguimiento Diario
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Casos pendientes agrupados por tiempo de inactividad</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : data ? (
        <div className="space-y-5">
          <GrupoCard
            title="Sin movimiento: 30 a 60 días"
            casos={data.sin30dias}
            color="border-l-yellow-500"
            onVer={(id) => setLocation(`/ficha/${id}`)}
          />
          <GrupoCard
            title="Sin movimiento: 60 a 90 días"
            casos={data.sin60dias}
            color="border-l-orange-500"
            onVer={(id) => setLocation(`/ficha/${id}`)}
          />
          <GrupoCard
            title="Sin movimiento: más de 90 días"
            casos={data.sin90dias}
            color="border-l-red-600"
            onVer={(id) => setLocation(`/ficha/${id}`)}
          />
        </div>
      ) : null}
    </div>
  );
}
