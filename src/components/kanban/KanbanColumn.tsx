import { Task, TaskStatus, TaskTag } from '@/types/project';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  tags?: TaskTag[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const statusStyles = {
  'backlog': 'border-t-status-backlog',
  'todo': 'border-t-status-todo',
  'in-progress': 'border-t-status-progress',
  'review': 'border-t-status-review',
  'done': 'border-t-status-done',
};

export function KanbanColumn({ 
  title, 
  status, 
  tasks, 
  tags = [],
  onDragOver, 
  onDrop, 
  onDragStart,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onAddTask
}: KanbanColumnProps) {
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

  return (
    <div
      className={cn(
        "flex min-h-[500px] w-72 flex-shrink-0 flex-col rounded-xl border border-border bg-muted/30 border-t-4",
        statusStyles[status]
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
            {totalStoryPoints > 0 && (
              <span className="text-xs text-muted-foreground">
                • {totalStoryPoints} pts
              </span>
            )}
            {totalHours > 0 && (
              <span className="text-xs text-muted-foreground">
                • {totalHours}h
              </span>
            )}
          </div>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0 ml-2">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3 p-3 overflow-y-auto scrollbar-thin">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            tags={tags}
            onDragStart={onDragStart}
            onClick={onTaskClick}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground mb-2">Drop tasks here</p>
            {onAddTask && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onAddTask(status)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Task Button */}
      {tasks.length > 0 && onAddTask && (
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onAddTask(status)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}
