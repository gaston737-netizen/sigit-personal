import { useState } from "react";
import { useGetReporte, getGetReporteQueryKey } from "@workspace/api-client-react";
import { FileBarChart, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const MESES = [
  { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
  { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const ANIOS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function Reportes() {
  const { toast } = useToast();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(currentYear);
  const [generado, setGenerado] = useState(false);
  const [incluirPendientes, setIncluirPendientes] = useState(true);
  const [incluirTurnos, setIncluirTurnos] = useState(true);
  const [incluirAtendidos, setIncluirAtendidos] = useState(true);
  const [incluirCriticos, setIncluirCriticos] = useState(true);
  const [incluirEspecialidad, setIncluirEspecialidad] = useState(true);

  const params = { mes, anio };
  const { data: reporte, isLoading } = useGetReporte(params, {
    query: { queryKey: getGetReporteQueryKey(params), enabled: generado },
  });

  const handleGenerar = () => {
    setGenerado(true);
  };

  const handleExport = (format: string) => {
    toast({ title: `Exportando a ${format}`, description: "Esta funcionalidad estará disponible próximamente." });
  };

  const mesLabel = MESES.find((m) => m.value === mes)?.label ?? "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <FileBarChart className="w-6 h-6 text-primary" />
          Reportes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generación de reportes mensuales de interconsultas</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reporte Mensual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mes</Label>
              <Select value={String(mes)} onValueChange={(v) => { setMes(Number(v)); setGenerado(false); }}>
                <SelectTrigger data-testid="select-mes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Año</Label>
              <Select value={String(anio)} onValueChange={(v) => { setAnio(Number(v)); setGenerado(false); }}>
                <SelectTrigger data-testid="select-anio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIOS.map((a) => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Incluir en el reporte</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "pendientes", label: "Pendientes", checked: incluirPendientes, setter: setIncluirPendientes },
                { id: "turnos", label: "Turnos otorgados", checked: incluirTurnos, setter: setIncluirTurnos },
                { id: "atendidos", label: "Atendidos", checked: incluirAtendidos, setter: setIncluirAtendidos },
                { id: "criticos", label: "Críticos", checked: incluirCriticos, setter: setIncluirCriticos },
                { id: "especialidad", label: "Por especialidad", checked: incluirEspecialidad, setter: setIncluirEspecialidad },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(v) => item.setter(!!v)}
                    data-testid={`check-${item.id}`}
                  />
                  <Label htmlFor={item.id} className="cursor-pointer font-normal">{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerar} className="gap-2" data-testid="button-generar">
            <FileBarChart className="w-4 h-4" />
            Generar Reporte
          </Button>
        </CardContent>
      </Card>

      {generado && (
        isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : reporte ? (
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">{mesLabel} {anio}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleExport("Excel")} className="gap-1.5" data-testid="button-export-excel">
                  <Download className="w-3.5 h-3.5" />
                  Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport("PDF")} className="gap-1.5" data-testid="button-export-pdf">
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {incluirPendientes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center" data-testid="reporte-pendientes">
                    <p className="text-3xl font-bold text-blue-700">{reporte.pendientes}</p>
                    <p className="text-xs text-blue-600 mt-1">Pendientes</p>
                  </div>
                )}
                {incluirTurnos && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 text-center" data-testid="reporte-turnos">
                    <p className="text-3xl font-bold text-violet-700">{reporte.turnosOtorgados}</p>
                    <p className="text-xs text-violet-600 mt-1">Turnos Otorgados</p>
                  </div>
                )}
                {incluirAtendidos && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center" data-testid="reporte-atendidos">
                    <p className="text-3xl font-bold text-green-700">{reporte.atendidos}</p>
                    <p className="text-xs text-green-600 mt-1">Atendidos</p>
                  </div>
                )}
                {incluirCriticos && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center" data-testid="reporte-criticos">
                    <p className="text-3xl font-bold text-red-700">{reporte.criticos}</p>
                    <p className="text-xs text-red-600 mt-1">Críticos</p>
                  </div>
                )}
              </div>

              {incluirEspecialidad && reporte.porEspecialidad.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Por Especialidad</p>
                  <div className="space-y-2">
                    {reporte.porEspecialidad
                      .sort((a, b) => b.total - a.total)
                      .map((e) => (
                        <div key={e.especialidad} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded" data-testid={`esp-${e.especialidad}`}>
                          <span className="text-sm">{e.especialidad}</span>
                          <span className="font-bold text-sm">{e.total}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null
      )}
    </div>
  );
}
