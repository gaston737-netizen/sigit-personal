import { useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetInterconsulta,
  getGetInterconsultaQueryKey,
  useCreateObservacion,
  useCreateAdjunto,
  useCambiarEstado,
  useDeleteInterconsulta,
  getListInterconsultasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Image, PlusCircle, RefreshCw, Paperclip, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const estadoConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-blue-100 text-blue-800 border-blue-200" },
  con_turno: { label: "Con Turno", className: "bg-violet-100 text-violet-800 border-violet-200" },
  atendido: { label: "Atendido", className: "bg-green-100 text-green-800 border-green-200" },
  cerrado: { label: "Cerrado", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

const alertaConfig: Record<string, { label: string; className: string }> = {
  roja: { label: "Alerta Roja (+90 días)", className: "bg-red-100 text-red-800 border-red-300" },
  naranja: { label: "Alerta Naranja (+60 días)", className: "bg-orange-100 text-orange-800 border-orange-300" },
  amarilla: { label: "Alerta Amarilla (+30 días)", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  none: { label: "", className: "" },
};

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col space-y-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm text-foreground">{value || <span className="text-muted-foreground italic">—</span>}</span>
    </div>
  );
}

export default function Ficha() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showObsDialog, setShowObsDialog] = useState(false);
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);
  const [showAdjuntoDialog, setShowAdjuntoDialog] = useState(false);
  const [obsText, setObsText] = useState("");
  const [newEstado, setNewEstado] = useState("");
  const [estadoObs, setEstadoObs] = useState("");
  const [adjNombre, setAdjNombre] = useState("");
  const [adjTipo, setAdjTipo] = useState("pdf");

  const { data: ficha, isLoading, refetch } = useGetInterconsulta(id, {
    query: { enabled: !!id, queryKey: getGetInterconsultaQueryKey(id) },
  });

  const createObs = useCreateObservacion();
  const createAdj = useCreateAdjunto();
  const cambiarEstado = useCambiarEstado();
  const deleteInterconsulta = useDeleteInterconsulta();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetInterconsultaQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListInterconsultasQueryKey() });
  };

  const handleAddObservacion = () => {
    if (!obsText.trim()) return;
    createObs.mutate(
      { id, data: { texto: obsText } },
      {
        onSuccess: () => {
          toast({ title: "Observación agregada" });
          setObsText("");
          setShowObsDialog(false);
          invalidate();
          refetch();
        },
        onError: () => toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" }),
      }
    );
  };

  const handleCambiarEstado = () => {
    if (!newEstado) return;
    cambiarEstado.mutate(
      { id, data: { estado: newEstado, ...(estadoObs && { observacion: estadoObs }) } },
      {
        onSuccess: () => {
          toast({ title: "Estado actualizado" });
          setShowEstadoDialog(false);
          setNewEstado("");
          setEstadoObs("");
          invalidate();
          refetch();
        },
        onError: () => toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" }),
      }
    );
  };

  const handleAddAdjunto = () => {
    if (!adjNombre.trim()) return;
    createAdj.mutate(
      { id, data: { nombre: adjNombre, tipo: adjTipo } },
      {
        onSuccess: () => {
          toast({ title: "Adjunto registrado" });
          setAdjNombre("");
          setAdjTipo("pdf");
          setShowAdjuntoDialog(false);
          invalidate();
          refetch();
        },
        onError: () => toast({ title: "Error", description: "No se pudo agregar adjunto", variant: "destructive" }),
      }
    );
  };

  const handleCerrarCaso = () => {
    cambiarEstado.mutate(
      { id, data: { estado: "cerrado", observacion: "Caso cerrado." } },
      {
        onSuccess: () => {
          toast({ title: "Caso cerrado" });
          queryClient.invalidateQueries({ queryKey: getListInterconsultasQueryKey() });
          setLocation("/inicio");
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Interconsulta no encontrada</p>
        <Button variant="ghost" onClick={() => setLocation("/buscar")} className="mt-3">Volver al buscador</Button>
      </div>
    );
  }

  const alerta = alertaConfig[ficha.alerta];
  const estado = estadoConfig[ficha.estado];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2" data-testid="button-volver">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{ficha.apellidoNombre}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${estado?.className ?? ""}`}>
                {estado?.label ?? ficha.estado}
              </span>
              {ficha.alerta !== "none" && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${alerta?.className ?? ""}`}>
                  {alerta?.label}
                </span>
              )}
              {ficha.prioridad === "urgente" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold bg-orange-100 text-orange-800 border-orange-300">
                  Urgente
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Prontuario: <span className="font-mono">{ficha.prontuario}</span> · {ficha.diasTranscurridos} días transcurridos
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main data */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos del Interno</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <FieldRow label="Prontuario" value={ficha.prontuario} />
              <FieldRow label="DNI" value={ficha.dni} />
              <FieldRow label="Apellido y Nombre" value={ficha.apellidoNombre} />
              <FieldRow label="Pabellón" value={ficha.pabellon} />
              <FieldRow label="Complejo / Unidad" value={ficha.complejoUnidad} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos Médicos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <FieldRow label="Especialidad" value={ficha.especialidad} />
              <FieldRow label="Médico Solicitante" value={ficha.medicoSolicitante} />
              <FieldRow label="Prioridad" value={ficha.prioridad === "urgente" ? "Urgente" : "Normal"} />
              <div className="col-span-2"><FieldRow label="Motivo" value={ficha.motivo} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <FieldRow label="Estado Actual" value={estado?.label ?? ficha.estado} />
              <FieldRow label="Días Transcurridos" value={String(ficha.diasTranscurridos)} />
              <FieldRow label="Fecha Interconsulta" value={ficha.fechaInterconsulta} />
              <FieldRow label="Fecha Envío GDE" value={ficha.fechaEnvio} />
              <FieldRow label="Expediente GDE" value={ficha.expedienteGde} />
              <FieldRow label="Fecha Turno" value={ficha.fechaTurno} />
              <FieldRow label="Fecha Atención" value={ficha.fechaAtencion} />
              <FieldRow label="Último Movimiento" value={ficha.ultimoMovimiento} />
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observaciones</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowObsDialog(true)} className="gap-1.5 h-7 text-xs" data-testid="button-nueva-obs">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {ficha.observaciones && ficha.observaciones.length > 0 ? (
                <div className="space-y-3">
                  {ficha.observaciones.map((obs) => (
                    <div key={obs.id} className="border-l-2 border-primary/30 pl-4 py-1" data-testid={`obs-item-${obs.id}`}>
                      <p className="text-xs text-muted-foreground font-medium">{obs.fecha}</p>
                      <p className="text-sm mt-0.5">{obs.texto}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin observaciones registradas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: actions + adjuntos */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-2 justify-start" variant="outline" size="sm" onClick={() => setShowObsDialog(true)} data-testid="button-obs">
                <PlusCircle className="w-4 h-4" />
                Nueva Observación
              </Button>
              <Button className="w-full gap-2 justify-start" variant="outline" size="sm" onClick={() => setShowEstadoDialog(true)} data-testid="button-estado">
                <RefreshCw className="w-4 h-4" />
                Cambiar Estado
              </Button>
              <Button className="w-full gap-2 justify-start" variant="outline" size="sm" onClick={() => setShowAdjuntoDialog(true)} data-testid="button-adjunto">
                <Paperclip className="w-4 h-4" />
                Adjuntar Archivo
              </Button>
              <Separator />
              <Button className="w-full gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50" variant="ghost" size="sm" onClick={handleCerrarCaso} disabled={ficha.estado === "cerrado"} data-testid="button-cerrar">
                <X className="w-4 h-4" />
                Cerrar Caso
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adjuntos</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowAdjuntoDialog(true)} className="gap-1.5 h-7 text-xs">
                <PlusCircle className="w-3.5 h-3.5" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {ficha.adjuntos && ficha.adjuntos.length > 0 ? (
                <div className="space-y-2">
                  {ficha.adjuntos.map((adj) => (
                    <div key={adj.id} className="flex items-center gap-2.5 p-2 rounded hover:bg-muted/30 transition-colors" data-testid={`adj-item-${adj.id}`}>
                      {adj.tipo === "imagen" ? (
                        <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
                      <span className="text-sm">{adj.nombre}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin archivos adjuntos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Nueva Observación */}
      <Dialog open={showObsDialog} onOpenChange={setShowObsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Observación</DialogTitle>
          </DialogHeader>
          <Textarea
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            placeholder="Ingrese la observación..."
            rows={4}
            data-testid="textarea-obs-dialog"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObsDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddObservacion} disabled={createObs.isPending || !obsText.trim()} data-testid="button-guardar-obs">
              {createObs.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cambiar Estado */}
      <Dialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nuevo estado</Label>
              <Select value={newEstado} onValueChange={setNewEstado}>
                <SelectTrigger data-testid="select-estado">
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="con_turno">Con Turno</SelectItem>
                  <SelectItem value="atendido">Atendido</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observación (opcional)</Label>
              <Textarea
                value={estadoObs}
                onChange={(e) => setEstadoObs(e.target.value)}
                placeholder="Motivo del cambio de estado..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstadoDialog(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} disabled={cambiarEstado.isPending || !newEstado} data-testid="button-confirmar-estado">
              {cambiarEstado.isPending ? "Actualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adjuntar Archivo */}
      <Dialog open={showAdjuntoDialog} onOpenChange={setShowAdjuntoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjuntar Archivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre del archivo</Label>
              <Input
                value={adjNombre}
                onChange={(e) => setAdjNombre(e.target.value)}
                placeholder="Ej: Interconsulta.pdf"
                data-testid="input-adj-nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={adjTipo} onValueChange={setAdjTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="imagen">Imagen</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjuntoDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddAdjunto} disabled={createAdj.isPending || !adjNombre.trim()} data-testid="button-guardar-adj">
              {createAdj.isPending ? "Guardando..." : "Adjuntar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
