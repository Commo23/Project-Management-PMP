import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { TaskStatus, Task } from '@/types/project';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'À faire', status: 'todo' },
  { title: 'En cours', status: 'in-progress' },
  { title: 'Revue', status: 'review' },
  { title: 'Terminé', status: 'done' },
];

export function KanbanBoard() {
  const { tasks, updateTask, deleteTask } = useProject();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status });
      setDraggedTaskId(null);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(undefined);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kanban Board</h1>
          <p className="mt-2 text-muted-foreground">
            Glissez-déposez les tâches pour mettre à jour leur statut
          </p>
        </div>
        <Button onClick={() => handleAddTask('backlog')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={tasks.filter((t) => t.status === column.status)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onAddTask={() => handleAddTask(column.status)}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteClick}
          />
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        defaultStatus={defaultStatus}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la tâche"
        description="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
