import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { 
  GitBranch, 
  Table2, 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Users,
  Target,
  ListTodo,
  Calendar,
  UserCircle,
  Settings,
  Home,
  History,
  Link2
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { mode } = useProject();
  const { t, language } = useI18n();

  const navigationItems = [
    { id: 'dashboard', label: language === 'fr' ? 'Tableau de Bord' : 'Dashboard', icon: Home },
    { id: 'flow', label: t.nav.projectFlow, icon: GitBranch },
    { id: 'kanban', label: t.nav.kanbanBoard, icon: LayoutDashboard },
    { id: 'raci', label: t.nav.raciMatrix, icon: Table2 },
    { id: 'charts', label: t.nav.charts, icon: BarChart3 },
    { id: 'backlog', label: t.nav.productBacklog, icon: ListTodo },
    { id: 'wbs', label: t.nav.wbs, icon: Target },
    { id: 'risks', label: t.nav.riskRegister, icon: AlertTriangle },
    { id: 'stakeholders', label: t.nav.stakeholders, icon: Users },
    { id: 'team', label: t.nav.team, icon: UserCircle },
    { id: 'requirements', label: t.nav.requirements, icon: FileText },
    { id: 'gantt', label: t.nav.timeline, icon: Calendar },
    { id: 'history', label: language === 'fr' ? 'Historique' : 'History', icon: History },
    { id: 'integrations', label: language === 'fr' ? 'Intégrations' : 'Integrations', icon: Link2 },
    { id: 'settings', label: t.settings.settings, icon: Settings },
  ];

  return (
    <aside className="h-full w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="mb-2 flex items-center gap-2 px-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            mode === 'waterfall' ? 'bg-accent' : 
            mode === 'agile' ? 'bg-primary' : 
            'bg-warning'
          )} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {mode === 'hybrid' ? t.modes.hybrid : mode === 'waterfall' ? t.modes.waterfall : t.modes.agile} {t.modes.mode}
          </span>
        </div>
        
        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 px-3",
                  isActive && "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{language === 'fr' ? 'Astuce :' : 'Tip:'}</span> {language === 'fr' 
              ? 'Cliquez sur les phases du flux pour voir les intrants, extrants et outils détaillés.'
              : 'Click on phases in the flow to see detailed inputs, outputs, and tools.'}
          </p>
        </div>
      </div>
    </aside>
  );
}
