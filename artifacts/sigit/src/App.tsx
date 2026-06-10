import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout";
import Matutino from "@/pages/matutino";
import Inicio from "@/pages/inicio";
import Nueva from "@/pages/nueva";
import Buscar from "@/pages/buscar";
import Ficha from "@/pages/ficha";
import Alertas from "@/pages/alertas";
import Seguimiento from "@/pages/seguimiento";
import Reportes from "@/pages/reportes";
import Configuracion from "@/pages/configuracion";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Matutino} />
      <Route path="/inicio">
        <Layout><Inicio /></Layout>
      </Route>
      <Route path="/nueva">
        <Layout><Nueva /></Layout>
      </Route>
      <Route path="/buscar">
        <Layout><Buscar /></Layout>
      </Route>
      <Route path="/ficha/:id">
        <Layout><Ficha /></Layout>
      </Route>
      <Route path="/alertas">
        <Layout><Alertas /></Layout>
      </Route>
      <Route path="/seguimiento">
        <Layout><Seguimiento /></Layout>
      </Route>
      <Route path="/reportes">
        <Layout><Reportes /></Layout>
      </Route>
      <Route path="/configuracion">
        <Layout><Configuracion /></Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
