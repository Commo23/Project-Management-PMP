import { useState } from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';
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
import { RequirementsMatrix } from '@/components/requirements/RequirementsMatrix';
import { GanttChart } from '@/components/charts/GanttChart';

export default function Index() {
  const [activeView, setActiveView] = useState('flow');

  const renderView = () => {
    switch (activeView) {
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
      case 'requirements':
        return <RequirementsMatrix />;
      case 'gantt':
        return <GanttChart />;
      default:
        return <ProjectFlow />;
    }
  };

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="ml-64 flex-1 p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
