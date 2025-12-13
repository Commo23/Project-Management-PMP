import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, RefreshCw, Check } from 'lucide-react';

const probabilityColors = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
};

const impactColors = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

const responseIcons = {
  avoid: Shield,
  mitigate: RefreshCw,
  transfer: RefreshCw,
  accept: Check,
};

export function RiskRegister() {
  const { risks } = useProject();

  const getScoreColor = (score: number) => {
    if (score >= 12) return 'bg-destructive text-destructive-foreground';
    if (score >= 8) return 'bg-warning text-warning-foreground';
    if (score >= 4) return 'bg-info text-info-foreground';
    return 'bg-success text-success-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Risk Register</h1>
        <p className="mt-2 text-muted-foreground">
          Track and manage project risks
        </p>
      </div>

      {/* Risk Matrix Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {['Critical', 'High', 'Medium', 'Low'].map((level) => {
          const count = risks.filter(r => {
            const score = r.score;
            if (level === 'Critical') return score >= 12;
            if (level === 'High') return score >= 8 && score < 12;
            if (level === 'Medium') return score >= 4 && score < 8;
            return score < 4;
          }).length;

          return (
            <div key={level} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{level} Risks</span>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  level === 'Critical' && "text-destructive",
                  level === 'High' && "text-warning",
                  level === 'Medium' && "text-info",
                  level === 'Low' && "text-success",
                )} />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Risk List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Risk</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Probability</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Impact</th>
                <th className="p-4 text-center text-sm font-medium text-muted-foreground">Score</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Response</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Owner</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, index) => {
                const ResponseIcon = responseIcons[risk.response];
                return (
                  <tr 
                    key={risk.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{risk.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", probabilityColors[risk.probability])}>
                        {risk.probability}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", impactColors[risk.impact])}>
                        {risk.impact}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                        getScoreColor(risk.score)
                      )}>
                        {risk.score}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ResponseIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize text-sm text-foreground">{risk.response}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{risk.owner}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {risk.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
