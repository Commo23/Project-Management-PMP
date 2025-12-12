import { useProject } from '@/contexts/ProjectContext';
import { GanttChart } from './GanttChart';
import { BurndownChart } from './BurndownChart';
import { VelocityChart } from './VelocityChart';

export function ChartsView() {
  const { mode } = useProject();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Charts</h1>
        <p className="mt-2 text-muted-foreground">
          Visual analytics for tracking project progress
        </p>
      </div>

      <div className="grid gap-8">
        {mode === 'waterfall' && <GanttChart />}
        
        {mode === 'agile' && (
          <>
            <BurndownChart />
            <VelocityChart />
          </>
        )}

        {/* Show timeline for both modes */}
        {mode === 'waterfall' || (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-muted-foreground">
              Switch to Waterfall mode to see the Gantt chart, or use the current Agile charts above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
