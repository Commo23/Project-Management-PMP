import { TaskHistoryEntry } from '@/types/project';
import { format } from 'date-fns';
import { Clock, User, ArrowRight, Tag, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskHistoryProps {
  history: TaskHistoryEntry[];
}

const actionIcons = {
  created: CheckCircle,
  updated: Edit,
  status_changed: ArrowRight,
  assigned: User,
  tag_added: Tag,
  tag_removed: Tag,
  priority_changed: AlertCircle,
};

const actionLabels = {
  created: 'Created',
  updated: 'Updated',
  status_changed: 'Status changed',
  assigned: 'Assigned',
  tag_added: 'Tag added',
  tag_removed: 'Tag removed',
  priority_changed: 'Priority changed',
};

export function TaskHistory({ history }: TaskHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {history.map((entry) => {
          const Icon = actionIcons[entry.action] || Edit;
          return (
            <div
              key={entry.id}
              className="flex gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                entry.action === 'created' && 'bg-success/20 text-success',
                entry.action === 'status_changed' && 'bg-primary/20 text-primary',
                entry.action === 'assigned' && 'bg-info/20 text-info',
                entry.action === 'priority_changed' && 'bg-warning/20 text-warning',
                'bg-muted'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {actionLabels[entry.action]}
                  </span>
                  {entry.field && (
                    <span className="text-xs text-muted-foreground">
                      ({entry.field})
                    </span>
                  )}
                </div>
                {entry.oldValue && entry.newValue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="line-through opacity-60">{entry.oldValue}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium">{entry.newValue}</span>
                  </div>
                )}
                {entry.comment && (
                  <p className="text-sm text-muted-foreground mt-1">{entry.comment}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{entry.userName}</span>
                  <span>•</span>
                  <span>{format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

