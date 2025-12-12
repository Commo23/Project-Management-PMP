import { useProject } from '@/contexts/ProjectContext';
import { projectRoles, agileRoles } from '@/data/projectData';
import { RACIRole } from '@/types/project';
import { cn } from '@/lib/utils';

const raciColors: Record<RACIRole, string> = {
  'R': 'bg-primary text-primary-foreground',
  'A': 'bg-destructive text-destructive-foreground',
  'C': 'bg-warning text-warning-foreground',
  'I': 'bg-info text-info-foreground',
  '': 'bg-muted text-muted-foreground',
};

const raciLabels: Record<RACIRole, string> = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '': '-',
};

export function RACIMatrix() {
  const { phases, raci, setRaci, mode } = useProject();
  const roles = mode === 'waterfall' ? projectRoles : agileRoles;

  const getResponsibility = (phaseId: string, role: string): RACIRole => {
    const entry = raci.find(r => r.phaseId === phaseId && r.role === role);
    return entry?.responsibility || '';
  };

  const cycleResponsibility = (phaseId: string, role: string) => {
    const cycle: RACIRole[] = ['', 'R', 'A', 'C', 'I'];
    const current = getResponsibility(phaseId, role);
    const currentIndex = cycle.indexOf(current);
    const next = cycle[(currentIndex + 1) % cycle.length];

    setRaci(prev => {
      const existing = prev.find(r => r.phaseId === phaseId && r.role === role);
      if (existing) {
        return prev.map(r => 
          r.phaseId === phaseId && r.role === role 
            ? { ...r, responsibility: next }
            : r
        );
      }
      return [...prev, { phaseId, role, responsibility: next }];
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">RACI Matrix</h1>
        <p className="mt-2 text-muted-foreground">
          Define roles and responsibilities for each project phase
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/30 p-4">
        {(['R', 'A', 'C', 'I'] as RACIRole[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
              raciColors[type]
            )}>
              {type}
            </span>
            <span className="text-sm text-muted-foreground">{raciLabels[type]}</span>
          </div>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-left font-semibold text-foreground">Phase</th>
              {roles.map((role) => (
                <th key={role} className="p-4 text-center font-semibold text-foreground whitespace-nowrap">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phases.map((phase, index) => (
              <tr 
                key={phase.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/30",
                  index % 2 === 0 && "bg-muted/10"
                )}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "h-3 w-3 rounded-full",
                      phase.type === 'initiation' && 'bg-phase-initiation',
                      phase.type === 'planning' && 'bg-phase-planning',
                      phase.type === 'execution' && 'bg-phase-execution',
                      phase.type === 'monitoring' && 'bg-phase-monitoring',
                      phase.type === 'closing' && 'bg-phase-closing',
                    )} />
                    <span className="font-medium text-foreground">{phase.name}</span>
                  </div>
                </td>
                {roles.map((role) => {
                  const responsibility = getResponsibility(phase.id, role);
                  return (
                    <td key={role} className="p-4 text-center">
                      <button
                        onClick={() => cycleResponsibility(phase.id, role)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 mx-auto",
                          raciColors[responsibility],
                          "hover:scale-110 hover:shadow-md"
                        )}
                        title={`Click to change (${raciLabels[responsibility]})`}
                      >
                        {responsibility || '-'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
