import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import Settings from './Settings';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('settings');

  const handleViewChange = (view: string) => {
    if (view === 'settings') {
      setActiveView('settings');
    } else {
      navigate('/');
      // The Index page will handle the view change
    }
  };

  return (
    <SettingsProvider>
      <ProjectProvider>
        <div className="min-h-screen bg-background">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
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
              <Settings />
            </div>
          </main>
        </div>
      </div>
      </ProjectProvider>
    </SettingsProvider>
  );
}

