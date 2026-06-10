import { Link } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Clock, CheckCircle2, Calendar, AlertTriangle, PlusCircle, Search, FileBarChart, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const alertaColor: Record<string, string> = {
  roja: "bg-red-100 text-red-800 border-red-200",
  naranja: "bg-orange-100 text-orange-800 border-orange-200",
  amarilla: "bg-yellow-100 text-yellow-800 border-yellow-200",
  none: "bg-gray-100 text-gray-700 border-gray-200",
};

const alertaDot: Record<string, string> = {
  roja: "bg-red-500",
  naranja: "bg-orange-500",
  amarilla: "bg-yellow-500",
  none: "bg-gray-400",
};

export default function Inicio() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const today = format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Panel Principal</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
        </div>
        <Link href="/nueva">
          <Button className="gap-2" data-testid="button-nueva-interconsulta">
            <PlusCircle className="w-4 h-4" />
            Nueva Interconsulta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : stats ? (
          <>
            <Card className="border-l-4 border-l-blue-500" data-testid="stat-pendientes">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pendientes</p>
                    <p className="text-4xl font-bold text-blue-600 mt-1">{stats.pendientes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-violet-500" data-testid="stat-con-turno">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Con Turno</p>
                    <p className="text-4xl font-bold text-violet-600 mt-1">{stats.conTurno}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-violet-400 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500" data-testid="stat-atendidos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Atendidos</p>
                    <p className="text-4xl font-bold text-green-600 mt-1">{stats.atendidos}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500" data-testid="stat-criticos">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Críticos (+90 días)</p>
                    <p className="text-4xl font-bold text-red-600 mt-1">{stats.criticos}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Alertas activas */}
      {stats && stats.alertasActivas.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Alertas Activas
            </CardTitle>
            <Link href="/alertas">
              <Button variant="ghost" size="sm" className="text-xs">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {stats.alertasActivas.map((a) => (
                <Link key={a.id} href={`/ficha/${a.id}`}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity ${alertaColor[a.alerta] ?? alertaColor.none}`}
                    data-testid={`alerta-item-${a.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alertaDot[a.alerta] ?? alertaDot.none}`} />
                      <div>
                        <p className="font-medium text-sm">{a.apellidoNombre}</p>
                        <p className="text-xs opacity-75">{a.especialidad}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{a.diasTranscurridos} días</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/nueva">
            <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40 group" data-testid="action-nueva">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <PlusCircle className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Nueva Interconsulta</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/buscar">
            <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40 group" data-testid="action-buscar">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Buscar</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reportes">
            <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40 group" data-testid="action-reportes">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <FileBarChart className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Reportes</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/configuracion">
            <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40 group" data-testid="action-config">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Configuración</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
