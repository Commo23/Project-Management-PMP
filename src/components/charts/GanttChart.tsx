import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';

export function GanttChart() {
  const { ganttTasks } = useProject();

  // Calculate date range
  const allDates = ganttTasks.flatMap(t => [parseISO(t.startDate), parseISO(t.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = differenceInDays(parseISO(startDate), minDate);
    const duration = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    const left = (start / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  const phaseColors = {
    init: 'bg-phase-initiation',
    plan: 'bg-phase-planning',
    exec: 'bg-phase-execution',
    mon: 'bg-phase-monitoring',
    close: 'bg-phase-closing',
    vision: 'bg-phase-initiation',
    'release-plan': 'bg-phase-planning',
    sprint: 'bg-phase-execution',
    review: 'bg-phase-monitoring',
    release: 'bg-phase-closing',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
        <p className="text-muted-foreground">Gantt chart showing project phases and milestones</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{format(minDate, 'MMM d, yyyy')}</span>
            <span>{format(maxDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y divide-border">
          {ganttTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              {/* Task Name */}
              <div className="w-48 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {task.isMilestone && (
                    <span className="h-2 w-2 rotate-45 bg-warning" />
                  )}
                  <span className={cn(
                    "text-sm",
                    task.isMilestone ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {task.name}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-8 flex-1 rounded bg-muted/50">
                {task.isMilestone ? (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 bg-warning shadow-md"
                    style={{ left: getBarStyle(task.startDate, task.endDate).left }}
                  />
                ) : (
                  <div
                    className={cn(
                      "absolute top-1 bottom-1 rounded shadow-sm transition-all",
                      phaseColors[task.phaseId as keyof typeof phaseColors] || 'bg-primary'
                    )}
                    style={getBarStyle(task.startDate, task.endDate)}
                  >
                    {/* Progress */}
                    <div 
                      className="absolute inset-y-0 left-0 rounded bg-foreground/20"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="w-16 flex-shrink-0 text-right text-sm text-muted-foreground">
                {task.progress}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
