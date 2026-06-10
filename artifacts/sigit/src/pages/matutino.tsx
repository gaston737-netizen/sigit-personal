import { Link } from "wouter";
import { 
  useGetDashboardStats, 
  getGetDashboardStatsQueryKey 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, ArrowRight, Hospital, FileText, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Matutino() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey(),
    }
  });

  const today = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto text-primary-foreground shadow-lg">
            <Hospital className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Buen Día
          </h1>
          <p className="text-lg text-muted-foreground capitalize">
            {today}
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Casos Pendientes</p>
                    <p className="text-3xl font-bold text-foreground">{stats.pendientes}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alertas Críticas</p>
                    <p className="text-3xl font-bold text-red-600">{stats.criticos}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {stats.criticos > 0 && (
              <Card className="border-red-200 bg-red-50/50 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900">Atención Requerida</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Hay {stats.criticos} interconsultas con más de 90 días de demora que requieren revisión inmediata.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link href="/alertas" className="flex-1 sm:flex-none">
                <Button size="lg" variant={stats.criticos > 0 ? "destructive" : "default"} className="w-full sm:w-auto px-8">
                  Ir a Alertas
                </Button>
              </Link>
              <Link href="/inicio" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 group">
                  Panel Principal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
