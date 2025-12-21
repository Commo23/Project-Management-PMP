import { Task, TaskTag } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { 
  GripVertical, 
  User, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  Edit, 
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanCardProps {
  task: Task;
  tags?: TaskTag[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/20 text-info',
  high: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
};

export function KanbanCard({ 
  task, 
  tags = [], 
  onDragStart, 
  onClick,
  onEdit,
  onDelete 
}: KanbanCardProps) {
  const { settings } = useSettings();
  const taskTags = tags.filter(tag => task.tags?.includes(tag.id));
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done';
  const isDueToday = dueDate && isToday(dueDate) && task.status !== 'done';
  
  // Card size based on settings
  const cardSizeClasses = {
    small: 'p-2 text-xs',
    medium: 'p-3 text-sm',
    large: 'p-4 text-base',
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick?.(task)}
      className={cn(
        "group cursor-grab rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 active:cursor-grabbing active:opacity-70",
        cardSizeClasses[settings.kanbanCardSize],
        onClick && "cursor-pointer"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <Badge className={cn("text-xs", priorityStyles[task.priority])}>
            {task.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
          {isDueToday && !isOverdue && (
            <Badge variant="outline" className="text-xs border-warning text-warning">
              Due Today
            </Badge>
          )}
        </div>
      </div>
      
      <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{task.title}</h4>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {task.description}
      </p>

      {/* Tags */}
      {settings.kanbanShowTags && taskTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {taskTags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              <TagIcon className="h-2.5 w-2.5 mr-0.5" />
              {tag.name}
            </Badge>
          ))}
          {taskTags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              +{taskTags.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {settings.kanbanShowAssignees && task.assignee && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{task.assignee}</span>
            </div>
          )}
          {settings.kanbanShowStoryPoints && task.storyPoints && (
            <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary flex-shrink-0">
              {task.storyPoints}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {settings.kanbanShowDueDates && dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[10px]",
              isOverdue && "text-destructive",
              isDueToday && "text-warning",
              !isOverdue && !isDueToday && "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{format(dueDate, 'MMM dd')}</span>
            </div>
          )}
          {settings.kanbanShowEstimatedHours && task.estimatedHours && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
