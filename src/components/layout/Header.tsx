import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Layers, RefreshCw, Zap, Download, Settings, FileJson } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const { mode, setMode, tasks, backlog, risks, stakeholders, requirements, phases } = useProject();

  const handleExport = () => {
    const data = {
      mode,
      phases,
      tasks,
      backlog,
      risks,
      stakeholders,
      requirements,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmp-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Projet exporté avec succès');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-md">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
              PMP Flow Designer
            </span>
            <span className="text-xs text-muted-foreground">
              Visualisation de gestion de projet
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1">
          <Button
            variant={mode === 'waterfall' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('waterfall')}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Waterfall</span>
          </Button>
          <Button
            variant={mode === 'agile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('agile')}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Agile</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
