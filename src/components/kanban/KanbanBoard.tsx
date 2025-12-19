import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { TaskStatus, Task, TaskTag, TaskHistoryEntry } from '@/types/project';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import { TaskDetailDialog } from './TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, X } from 'lucide-react';
import { sampleTags } from '@/data/projectData';
import { cn } from '@/lib/utils';

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' },
];

export function KanbanBoard() {
  const { tasks, updateTask, phases, setTasks, taskTags, taskHistory } = useProject();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const tags: TaskTag[] = taskTags || sampleTags;

  // Get unique assignees
  const assignees = useMemo(() => {
    const unique = new Set(tasks.map(t => t.assignee).filter(Boolean));
    return Array.from(unique);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      const matchesTag = filterTag === 'all' || 
        (task.tags && task.tags.includes(filterTag));
      
      const matchesAssignee = filterAssignee === 'all' || 
        task.assignee === filterAssignee;

      return matchesSearch && matchesPriority && matchesTag && matchesAssignee;
    });
  }, [tasks, searchQuery, filterPriority, filterTag, filterAssignee]);

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
      updateTask(draggedTaskId, { 
        status,
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: 'current-user'
      });
      setDraggedTaskId(null);
    }
  };

  const handleAddTask = (status?: TaskStatus) => {
    setEditingTask(null);
    setDialogMode('add');
    if (status) {
      // Pre-fill status if adding from a column
      setEditingTask({ 
        id: '', 
        title: '', 
        description: '', 
        status, 
        priority: 'medium', 
        phaseId: phases[0]?.id || '',
        tags: [],
        createdAt: new Date().toISOString().split('T')[0]
      } as Task);
    }
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogMode('edit');
    setTaskDialogOpen(true);
    setTaskDetailOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dialogMode === 'add') {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'current-user',
        updatedBy: 'current-user',
      };
      setTasks(prev => [...prev, newTask]);
    } else if (editingTask) {
      updateTask(editingTask.id, {
        ...taskData,
        updatedAt: new Date().toISOString().split('T')[0],
        updatedBy: 'current-user',
      });
    }
    setTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setTaskDetailOpen(false);
      setSelectedTask(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPriority('all');
    setFilterTag('all');
    setFilterAssignee('all');
  };

  const hasActiveFilters = searchQuery || filterPriority !== 'all' || filterTag !== 'all' || filterAssignee !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kanban Board</h1>
          <p className="mt-2 text-muted-foreground">
            Drag and drop tasks to update their status
          </p>
        </div>
        <Button onClick={() => handleAddTask()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filters</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Priority Filter */}
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger>
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterPriority !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Priority: {filterPriority}
                <button onClick={() => setFilterPriority('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterTag !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Tag: {tags.find(t => t.id === filterTag)?.name}
                <button onClick={() => setFilterTag('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterAssignee !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Assignee: {filterAssignee}
                <button onClick={() => setFilterAssignee('all')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={filteredTasks.filter((t) => t.status === column.status)}
            tags={tags}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onTaskClick={handleTaskClick}
            onTaskEdit={handleEditTask}
            onTaskDelete={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        phases={phases.map(p => ({ id: p.id, name: p.name }))}
        tags={tags}
        mode={dialogMode}
        onSave={handleSaveTask}
      />

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={selectedTask}
        tags={tags}
        history={taskHistory.filter(h => h.taskId === selectedTask?.id)}
        onEdit={handleEditTask}
      />
    </div>
  );
}
