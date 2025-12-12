import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Building, Lock } from 'lucide-react';

const influenceColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-primary/20 text-primary',
};

const engagementColors = {
  unaware: 'bg-muted text-muted-foreground',
  resistant: 'bg-destructive/20 text-destructive',
  neutral: 'bg-warning/20 text-warning',
  supportive: 'bg-success/20 text-success',
  leading: 'bg-primary text-primary-foreground',
};

export function StakeholderMatrix() {
  const { stakeholders } = useProject();

  // Grid positions for Power/Interest matrix
  const getGridPosition = (influence: string, interest: string) => {
    const x = interest === 'low' ? 0 : interest === 'medium' ? 1 : 2;
    const y = influence === 'low' ? 2 : influence === 'medium' ? 1 : 0;
    return { x, y };
  };

  const gridLabels = [
    ['Keep Satisfied', 'Manage Closely', 'Key Players'],
    ['Keep Informed', 'Keep Informed', 'Manage Closely'],
    ['Monitor', 'Keep Informed', 'Keep Satisfied'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stakeholder Engagement</h1>
          <p className="mt-2 text-muted-foreground">
            Power/Interest matrix for stakeholder management
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Lock className="h-3 w-3" />
          Confidential
        </Badge>
      </div>

      {/* Power/Interest Matrix */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">← Low Interest → High Interest</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(row => (
            [0, 1, 2].map(col => {
              const stakeholdersInCell = stakeholders.filter(s => {
                const pos = getGridPosition(s.influence, s.interest);
                return pos.x === col && pos.y === row;
              });

              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    "rounded-lg border border-border p-4 min-h-[120px]",
                    row === 0 && col >= 1 && "bg-primary/5",
                    row <= 1 && col === 2 && "bg-primary/5",
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {gridLabels[row][col]}
                  </p>
                  <div className="space-y-2">
                    {stakeholdersInCell.map(s => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 rounded bg-card p-2 text-xs shadow-sm border border-border"
                      >
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-foreground truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <p className="text-sm font-medium text-muted-foreground rotate-0">
            ↑ High Power | Low Power ↓
          </p>
        </div>
      </div>

      {/* Stakeholder List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h2 className="font-semibold text-foreground">Stakeholder Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Organization</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Influence</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Interest</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((stakeholder, index) => (
                <tr 
                  key={stakeholder.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    index % 2 === 0 && "bg-muted/10"
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{stakeholder.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{stakeholder.role}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {stakeholder.organization}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={cn("capitalize", influenceColors[stakeholder.influence])}>
                      {stakeholder.influence}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={cn("capitalize", influenceColors[stakeholder.interest])}>
                      {stakeholder.interest}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={cn("capitalize", engagementColors[stakeholder.engagementLevel])}>
                      {stakeholder.engagementLevel}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
