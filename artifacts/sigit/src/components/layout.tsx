import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  PlusCircle, 
  Search, 
  AlertTriangle, 
  Activity, 
  FileBarChart, 
  Settings,
  Hospital
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/inicio", icon: Home },
  { name: "Nueva Interconsulta", href: "/nueva", icon: PlusCircle },
  { name: "Buscar", href: "/buscar", icon: Search },
  { name: "Alertas", href: "/alertas", icon: AlertTriangle },
  { name: "Seguimiento", href: "/seguimiento", icon: Activity },
  { name: "Reportes", href: "/reportes", icon: FileBarChart },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r bg-card shadow-sm z-10 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border space-x-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Hospital className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">SIGIT Personal</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (location.startsWith("/ficha") && item.href === "/buscar");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-xs">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Administrador</span>
              <span className="text-xs text-muted-foreground">Turno Mañana</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
