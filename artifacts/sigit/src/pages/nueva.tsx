import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInterconsulta, getListInterconsultasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X } from "lucide-react";

const schema = z.object({
  prontuario: z.string().min(1, "El prontuario es obligatorio"),
  dni: z.string().optional(),
  apellidoNombre: z.string().min(1, "El apellido y nombre son obligatorios"),
  pabellon: z.string().optional(),
  complejoUnidad: z.string().optional(),
  especialidad: z.string().min(1, "La especialidad es obligatoria"),
  medicoSolicitante: z.string().optional(),
  prioridad: z.enum(["normal", "urgente"]).default("normal"),
  motivo: z.string().optional(),
  fechaInterconsulta: z.string().min(1, "La fecha es obligatoria"),
  expedienteGde: z.string().optional(),
  observacionInicial: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Nueva() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateInterconsulta();

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prontuario: "",
      dni: "",
      apellidoNombre: "",
      pabellon: "",
      complejoUnidad: "",
      especialidad: "",
      medicoSolicitante: "",
      prioridad: "normal",
      motivo: "",
      fechaInterconsulta: todayStr,
      expedienteGde: "",
      observacionInicial: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const data = {
      prontuario: values.prontuario,
      apellidoNombre: values.apellidoNombre,
      especialidad: values.especialidad,
      prioridad: values.prioridad,
      fechaInterconsulta: values.fechaInterconsulta,
      ...(values.dni && { dni: values.dni }),
      ...(values.pabellon && { pabellon: values.pabellon }),
      ...(values.complejoUnidad && { complejoUnidad: values.complejoUnidad }),
      ...(values.medicoSolicitante && { medicoSolicitante: values.medicoSolicitante }),
      ...(values.motivo && { motivo: values.motivo }),
      ...(values.expedienteGde && { expedienteGde: values.expedienteGde }),
      ...(values.observacionInicial && { observacionInicial: values.observacionInicial }),
    };

    createMutation.mutate(
      { data },
      {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: getListInterconsultasQueryKey() });
          toast({ title: "Interconsulta creada", description: `Registrada correctamente para ${created.apellidoNombre}` });
          setLocation(`/ficha/${created.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo guardar la interconsulta", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/inicio")} className="gap-2" data-testid="button-volver">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Interconsulta</h1>
          <p className="text-sm text-muted-foreground">Tiempo estimado de carga: 30 segundos</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del interno */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">Datos del Interno</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prontuario">Prontuario <span className="text-red-500">*</span></Label>
              <Input id="prontuario" {...form.register("prontuario")} placeholder="Ej: 45821" data-testid="input-prontuario" />
              {form.formState.errors.prontuario && (
                <p className="text-xs text-red-500">{form.formState.errors.prontuario.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" {...form.register("dni")} placeholder="Ej: 28.453.901" data-testid="input-dni" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="apellidoNombre">Apellido y Nombre <span className="text-red-500">*</span></Label>
              <Input id="apellidoNombre" {...form.register("apellidoNombre")} placeholder="Ej: Pérez, Juan Carlos" data-testid="input-apellido-nombre" />
              {form.formState.errors.apellidoNombre && (
                <p className="text-xs text-red-500">{form.formState.errors.apellidoNombre.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pabellon">Pabellón</Label>
              <Input id="pabellon" {...form.register("pabellon")} placeholder="Ej: Pabellón 3" data-testid="input-pabellon" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="complejoUnidad">Complejo / Unidad</Label>
              <Input id="complejoUnidad" {...form.register("complejoUnidad")} placeholder="Ej: Complejo I" data-testid="input-complejo" />
            </div>
          </CardContent>
        </Card>

        {/* Datos médicos */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">Datos Médicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="especialidad">Especialidad <span className="text-red-500">*</span></Label>
                <Input id="especialidad" {...form.register("especialidad")} placeholder="Ej: Cardiología" data-testid="input-especialidad" />
                {form.formState.errors.especialidad && (
                  <p className="text-xs text-red-500">{form.formState.errors.especialidad.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="medicoSolicitante">Médico Solicitante</Label>
                <Input id="medicoSolicitante" {...form.register("medicoSolicitante")} placeholder="Ej: Dr. García Morales" data-testid="input-medico" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prioridad <span className="text-red-500">*</span></Label>
              <RadioGroup
                value={form.watch("prioridad")}
                onValueChange={(v) => form.setValue("prioridad", v as "normal" | "urgente")}
                className="flex gap-6"
                data-testid="radio-prioridad"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="cursor-pointer font-normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgente" id="urgente" />
                  <Label htmlFor="urgente" className="cursor-pointer font-normal text-orange-600">Urgente</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea id="motivo" {...form.register("motivo")} placeholder="Describa el motivo de la interconsulta..." rows={3} data-testid="textarea-motivo" />
            </div>
          </CardContent>
        </Card>

        {/* Datos administrativos */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">Datos Administrativos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fechaInterconsulta">Fecha Interconsulta <span className="text-red-500">*</span></Label>
              <Input id="fechaInterconsulta" {...form.register("fechaInterconsulta")} placeholder="DD/MM/AAAA" data-testid="input-fecha" />
              {form.formState.errors.fechaInterconsulta && (
                <p className="text-xs text-red-500">{form.formState.errors.fechaInterconsulta.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expedienteGde">Expediente GDE</Label>
              <Input id="expedienteGde" {...form.register("expedienteGde")} placeholder="Ej: EX-2026-00123456-GCABA" data-testid="input-expediente" />
            </div>
          </CardContent>
        </Card>

        {/* Observaciones iniciales */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register("observacionInicial")}
              placeholder="Observación inicial (opcional)..."
              rows={3}
              data-testid="textarea-observacion"
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={createMutation.isPending} className="gap-2" data-testid="button-guardar">
            <Save className="w-4 h-4" />
            {createMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setLocation("/inicio")} className="gap-2" data-testid="button-cancelar">
            <X className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
