import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
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
  Calendar
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  { id: 'flow', label: 'Project Flow', icon: GitBranch },
  { id: 'kanban', label: 'Kanban Board', icon: LayoutDashboard },
  { id: 'raci', label: 'RACI Matrix', icon: Table2 },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'backlog', label: 'Product Backlog', icon: ListTodo },
  { id: 'wbs', label: 'WBS', icon: Target },
  { id: 'risks', label: 'Risk Register', icon: AlertTriangle },
  { id: 'stakeholders', label: 'Stakeholders', icon: Users },
  { id: 'requirements', label: 'Requirements', icon: FileText },
  { id: 'gantt', label: 'Timeline', icon: Calendar },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { mode } = useProject();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="mb-2 flex items-center gap-2 px-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            mode === 'waterfall' ? 'bg-accent' : 'bg-primary'
          )} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {mode} Mode
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
            <span className="font-semibold text-foreground">Tip:</span> Click on phases in the flow to see detailed inputs, outputs, and tools.
          </p>
        </div>
      </div>
    </aside>
  );
}
