import { Task, TaskTag, TaskHistoryEntry } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskHistory } from './TaskHistory';
import { X, User, Calendar, Clock, Tag as TagIcon, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  tags: TaskTag[];
  history: TaskHistoryEntry[];
  onEdit?: (task: Task) => void;
}

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function TaskDetailDialog({ 
  open, 
  onOpenChange, 
  task, 
  tags = [], 
  history = [],
  onEdit 
}: TaskDetailDialogProps) {
  if (!task) return null;

  const taskTags = tags.filter(tag => task.tags?.includes(tag.id));
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const startDate = task.startDate ? new Date(task.startDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("text-xs", priorityStyles[task.priority])}>
                  {task.priority}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>

            {/* Tags */}
            {taskTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {taskTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {task.assignee && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignee
                  </h3>
                  <p className="text-sm text-muted-foreground">{task.assignee}</p>
                </div>
              )}

              {startDate && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'PPP')}
                  </p>
                </div>
              )}

              {dueDate && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </h3>
                  <p className={cn(
                    "text-sm",
                    isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                  )}>
                    {format(dueDate, 'PPP')}
                  </p>
                </div>
              )}

              {task.storyPoints && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Story Points</h3>
                  <p className="text-sm text-muted-foreground">{task.storyPoints}</p>
                </div>
              )}

              {task.estimatedHours && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </h3>
                  <p className="text-sm text-muted-foreground">{task.estimatedHours}h</p>
                </div>
              )}

              {task.actualHours && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Actual Hours
                  </h3>
                  <p className="text-sm text-muted-foreground">{task.actualHours}h</p>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Completed At</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(task.completedAt), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <TaskHistory history={history} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

