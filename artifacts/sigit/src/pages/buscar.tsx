import { useState } from "react";
import { useLocation } from "wouter";
import { useListInterconsultas, getListInterconsultasQueryKey } from "@workspace/api-client-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const estadoBadge: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-blue-100 text-blue-800 border-blue-200" },
  con_turno: { label: "Con Turno", className: "bg-violet-100 text-violet-800 border-violet-200" },
  atendido: { label: "Atendido", className: "bg-green-100 text-green-800 border-green-200" },
  cerrado: { label: "Cerrado", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

const alertaDot: Record<string, string> = {
  roja: "bg-red-500",
  naranja: "bg-orange-500",
  amarilla: "bg-yellow-500",
  none: "bg-transparent",
};

export default function Buscar() {
  const [, setLocation] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("apellido");
  const [submitted, setSubmitted] = useState("");
  const [submittedBy, setSubmittedBy] = useState("apellido");

  const params = submitted ? { search: submitted, searchBy: submittedBy } : undefined;
  const { data: results, isLoading } = useListInterconsultas(params, {
    query: { queryKey: getListInterconsultasQueryKey(params), enabled: !!submitted },
  });

  const handleSearch = () => {
    setSubmitted(searchText);
    setSubmittedBy(searchBy);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buscador General</h1>
        <p className="text-sm text-muted-foreground mt-1">Busque interconsultas por prontuario, apellido, DNI o expediente</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Ingrese el término de búsqueda..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-buscar"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              data-testid="button-buscar"
            >
              Buscar
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Buscar por</Label>
            <RadioGroup value={searchBy} onValueChange={setSearchBy} className="flex flex-wrap gap-5" data-testid="radio-buscar-por">
              {[
                { value: "prontuario", label: "Prontuario" },
                { value: "apellido", label: "Apellido" },
                { value: "dni", label: "DNI" },
                { value: "expediente", label: "Expediente GDE" },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`by-${opt.value}`} />
                  <Label htmlFor={`by-${opt.value}`} className="cursor-pointer font-normal">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {submitted && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resultados {results ? `(${results.length})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : results && results.length > 0 ? (
              <table className="w-full text-sm" data-testid="tabla-resultados">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Prontuario</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Apellido y Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Especialidad</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Estado</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Días</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onDoubleClick={() => setLocation(`/ficha/${r.id}`)}
                      onClick={() => setLocation(`/ficha/${r.id}`)}
                      data-testid={`row-resultado-${r.id}`}
                    >
                      <td className="py-3 px-4 font-mono text-xs">{r.prontuario}</td>
                      <td className="py-3 px-4 font-medium">{r.apellidoNombre}</td>
                      <td className="py-3 px-4 text-muted-foreground">{r.especialidad}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-medium ${estadoBadge[r.estado]?.className ?? ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${alertaDot[r.alerta] ?? ""}`} />
                          {estadoBadge[r.estado]?.label ?? r.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold text-sm ${r.diasTranscurridos >= 90 ? "text-red-600" : r.diasTranscurridos >= 60 ? "text-orange-600" : r.diasTranscurridos >= 30 ? "text-yellow-600" : "text-foreground"}`}>
                          {r.diasTranscurridos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No se encontraron resultados para "{submitted}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
