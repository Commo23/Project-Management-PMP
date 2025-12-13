import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Layers, RefreshCw, Zap, Download, Settings } from 'lucide-react';

export function Header() {
  const { mode, setMode } = useProject();

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
              Project Management Visualization
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
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="ghost" size="icon-sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
