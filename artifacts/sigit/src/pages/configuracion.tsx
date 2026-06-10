import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetConfiguracion,
  getGetConfiguracionQueryKey,
  useUpdateConfiguracion,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  diasAlertaAmarilla: z.coerce.number().min(1).max(365),
  diasAlertaNaranja: z.coerce.number().min(1).max(365),
  diasAlertaRoja: z.coerce.number().min(1).max(365),
  rutaAdjuntos: z.string().min(1),
  rutaBackups: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function Configuracion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useGetConfiguracion({
    query: { queryKey: getGetConfiguracionQueryKey() },
  });
  const updateMutation = useUpdateConfiguracion();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      diasAlertaAmarilla: 30,
      diasAlertaNaranja: 60,
      diasAlertaRoja: 90,
      rutaAdjuntos: "C:\\SIGIT\\Adjuntos",
      rutaBackups: "C:\\SIGIT\\Backups",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        diasAlertaAmarilla: config.diasAlertaAmarilla,
        diasAlertaNaranja: config.diasAlertaNaranja,
        diasAlertaRoja: config.diasAlertaRoja,
        rutaAdjuntos: config.rutaAdjuntos,
        rutaBackups: config.rutaBackups,
      });
    }
  }, [config, form]);

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetConfiguracionQueryKey() });
          toast({ title: "Configuración guardada", description: "Los cambios se aplicarán inmediatamente." });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Parámetros de alertas y rutas del sistema</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Días de Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="diasAmarilla">Alerta Amarilla (días)</Label>
                <Input
                  id="diasAmarilla"
                  type="number"
                  {...form.register("diasAlertaAmarilla")}
                  className="w-24"
                  data-testid="input-dias-amarilla"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="diasNaranja">Alerta Naranja (días)</Label>
                <Input
                  id="diasNaranja"
                  type="number"
                  {...form.register("diasAlertaNaranja")}
                  className="w-24"
                  data-testid="input-dias-naranja"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="diasRoja">Alerta Roja (días)</Label>
                <Input
                  id="diasRoja"
                  type="number"
                  {...form.register("diasAlertaRoja")}
                  className="w-24"
                  data-testid="input-dias-roja"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Rutas del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rutaAdjuntos">Ruta de Adjuntos</Label>
              <Input
                id="rutaAdjuntos"
                {...form.register("rutaAdjuntos")}
                placeholder="C:\SIGIT\Adjuntos"
                data-testid="input-ruta-adjuntos"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rutaBackups">Ruta de Backups</Label>
              <Input
                id="rutaBackups"
                {...form.register("rutaBackups")}
                placeholder="C:\SIGIT\Backups"
                data-testid="input-ruta-backups"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateMutation.isPending} className="gap-2" data-testid="button-guardar-config">
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}
