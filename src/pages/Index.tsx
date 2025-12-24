import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProjectFlow } from '@/components/flow/ProjectFlow';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { RACIMatrix } from '@/components/raci/RACIMatrix';
import { ChartsView } from '@/components/charts/ChartsView';
import { BacklogView } from '@/components/backlog/BacklogView';
import { WBSView } from '@/components/wbs/WBSView';
import { RiskRegister } from '@/components/risks/RiskRegister';
import { StakeholderMatrix } from '@/components/stakeholders/StakeholderMatrix';
import { TeamManagement } from '@/components/team/TeamManagement';
import { RequirementsMatrix } from '@/components/requirements/RequirementsMatrix';
import { GanttChart } from '@/components/charts/GanttChart';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { HistoryView } from '@/components/history/HistoryView';
import { IntegrationsPage } from '@/components/integrations/IntegrationsPage';
import { cn } from '@/lib/utils';

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleViewChange = (view: string) => {
    if (view === 'settings') {
      navigate('/settings');
    } else {
      setActiveView(view);
    }
  };

  const renderView = () => {
    try {
      switch (activeView) {
        case 'dashboard':
          return <Dashboard />;
        case 'flow':
          return <ProjectFlow />;
        case 'kanban':
          return <KanbanBoard />;
        case 'raci':
          return <RACIMatrix />;
        case 'charts':
          return <ChartsView />;
        case 'backlog':
          return <BacklogView />;
        case 'wbs':
          return <WBSView />;
        case 'risks':
          return <RiskRegister />;
        case 'stakeholders':
          return <StakeholderMatrix />;
        case 'team':
          return <TeamManagement />;
        case 'requirements':
          return <RequirementsMatrix />;
        case 'gantt':
          return <GanttChart />;
        case 'history':
          return <HistoryView />;
        case 'integrations':
          return <IntegrationsPage />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-destructive">Error Loading View</h1>
          <p className="mt-2 text-muted-foreground">{String(error)}</p>
        </div>
      );
    }
  };

  return (
    <SettingsProvider>
      <ProjectProvider>
        <div className="min-h-screen bg-background">
        <Header 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onViewChange={handleViewChange}
        />
        <div className="flex pt-16">
          <div className={cn(
            "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
          </div>
          <main className={cn(
            "flex-1 transition-all duration-300 min-w-0",
            sidebarOpen ? "ml-64" : "ml-0"
          )}>
            <div className="w-full h-full p-4 md:p-8 overflow-x-auto">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
      </ProjectProvider>
    </SettingsProvider>
  );
}
