import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Plus, Search, X, ZoomIn, ZoomOut, Calendar, TrendingUp, DollarSign, Users, Link2 } from 'lucide-react';
import { GanttTask } from '@/types/project';
import { GanttTaskDialog } from './GanttTaskDialog';

const phaseColors = {
  init: 'bg-blue-500',
  plan: 'bg-green-500',
  exec: 'bg-yellow-500',
  mon: 'bg-purple-500',
  close: 'bg-red-500',
  vision: 'bg-blue-500',
  'release-plan': 'bg-green-500',
  sprint: 'bg-yellow-500',
  review: 'bg-purple-500',
  release: 'bg-red-500',
};

const statusColors = {
  'not-started': 'bg-gray-400',
  'in-progress': 'bg-blue-500',
  'completed': 'bg-green-500',
  'on-hold': 'bg-yellow-500',
  'cancelled': 'bg-red-500',
};

export function GanttChart() {
  const { 
    ganttTasks,
    deleteGanttTask,
    phases,
    tasks,
    wbs,
    backlog,
    requirements,
    risks
  } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<GanttTask | null>(null);

  const handleAddTask = () => {
    setSelectedTask(null);
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: GanttTask) => {
    setSelectedTask(task);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (task: GanttTask) => {
    if (confirm(`Are you sure you want to delete task "${task.name}"?`)) {
      deleteGanttTask(task.id);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return ganttTasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || task.type === filterType;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPhase = filterPhase === 'all' || task.phaseId === filterPhase;
      return matchesSearch && matchesType && matchesStatus && matchesPhase;
    });
  }, [ganttTasks, searchTerm, filterType, filterStatus, filterPhase]);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const today = new Date();
      return {
        minDate: today,
        maxDate: addDays(today, 30),
        totalDays: 30,
      };
    }
    const allDates = filteredTasks.flatMap(t => [
      parseISO(t.startDate), 
      parseISO(t.endDate),
      t.actualStartDate ? parseISO(t.actualStartDate) : null,
      t.actualEndDate ? parseISO(t.actualEndDate) : null,
    ].filter(Boolean) as Date[]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = differenceInDays(maxDate, minDate) + 1;
    return { minDate, maxDate, totalDays };
  }, [filteredTasks]);

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = differenceInDays(parseISO(startDate), dateRange.minDate);
    const duration = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    const left = (start / dateRange.totalDays) * 100;
    const width = (duration / dateRange.totalDays) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  // Statistics
  const stats = useMemo(() => {
    const total = ganttTasks.length;
    const byStatus = {
      'not-started': ganttTasks.filter(t => t.status === 'not-started').length,
      'in-progress': ganttTasks.filter(t => t.status === 'in-progress').length,
      'completed': ganttTasks.filter(t => t.status === 'completed').length,
      'on-hold': ganttTasks.filter(t => t.status === 'on-hold').length,
      'cancelled': ganttTasks.filter(t => t.status === 'cancelled').length,
    };
    const milestones = ganttTasks.filter(t => t.isMilestone).length;
    const totalBudget = ganttTasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalActualCost = ganttTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const averageProgress = ganttTasks.length > 0
      ? Math.round(ganttTasks.reduce((sum, t) => sum + t.progress, 0) / ganttTasks.length)
      : 0;

    return {
      total,
      byStatus,
      milestones,
      totalBudget,
      totalActualCost,
      averageProgress,
    };
  }, [ganttTasks]);

  const getLinkedEntityNames = (task: GanttTask): string[] => {
    const links: string[] = [];
    if (task.linkedTaskIds && task.linkedTaskIds.length > 0) {
      const taskNames = task.linkedTaskIds
        .map(id => tasks.find(t => t.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (taskNames) links.push(`Tasks: ${taskNames}`);
    }
    if (task.linkedWBSNodeIds && task.linkedWBSNodeIds.length > 0) {
      const wbsNames = task.linkedWBSNodeIds
        .map(id => {
          const node = wbs.find(w => w.id === id);
          return node ? `${node.code} - ${node.name}` : null;
        })
        .filter(Boolean)
        .join(', ');
      if (wbsNames) links.push(`WBS: ${wbsNames}`);
    }
    if (task.linkedBacklogItemIds && task.linkedBacklogItemIds.length > 0) {
      const backlogNames = task.linkedBacklogItemIds
        .map(id => backlog.find(b => b.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (backlogNames) links.push(`Backlog: ${backlogNames}`);
    }
    if (task.linkedRequirementIds && task.linkedRequirementIds.length > 0) {
      const reqNames = task.linkedRequirementIds
        .map(id => {
          const req = requirements.find(r => r.id === id);
          return req ? `${req.code} - ${req.title}` : null;
        })
        .filter(Boolean)
        .join(', ');
      if (reqNames) links.push(`Requirements: ${reqNames}`);
    }
    if (task.linkedRiskIds && task.linkedRiskIds.length > 0) {
      const riskNames = task.linkedRiskIds
        .map(id => risks.find(r => r.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (riskNames) links.push(`Risks: ${riskNames}`);
    }
    return links;
  };

  // Generate date headers based on zoom level
  const dateHeaders = useMemo(() => {
    const headers: Array<{ date: Date; label: string }> = [];
    const start = startOfWeek(dateRange.minDate);
    const end = endOfWeek(dateRange.maxDate);

    if (zoomLevel === 'day') {
      eachDayOfInterval({ start, end }).forEach(date => {
        headers.push({ date, label: format(date, 'MMM d') });
      });
    } else if (zoomLevel === 'week') {
      let current = start;
      while (current <= end) {
        headers.push({ date: current, label: format(current, 'MMM d') });
        current = addDays(current, 7);
      }
    } else {
      // month
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      while (current <= endMonth) {
        headers.push({ date: current, label: format(current, 'MMM yyyy') });
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }
    }

    return headers;
  }, [dateRange, zoomLevel]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-foreground">Project Timeline</h1>
          <p className="mt-2 text-muted-foreground">
            Gantt chart showing project timeline with phases, tasks, and milestones (PMBOK aligned)
          </p>
        </div>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Tasks</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">
          <div className="text-sm text-muted-foreground">Milestones</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.milestones}</div>
        </div>
        <div className="rounded-xl border border-blue-500 bg-blue-500/10 p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{stats.byStatus['in-progress']}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</div>
        </div>
        <div className="rounded-xl border border-purple-500 bg-purple-500/10 p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Avg Progress</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </div>
          <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Actual</span>
          </div>
          <div className="text-2xl font-bold">${stats.totalActualCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="type">Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="phase">Phase</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="phase">Phase</Label>
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              {phases.map((phase) => (
                <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="zoom">Zoom</Label>
          <div className="flex gap-1">
            <Button
              variant={zoomLevel === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('day')}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant={zoomLevel === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('week')}
            >
              Week
            </Button>
            <Button
              variant={zoomLevel === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setZoomLevel('month')}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPhase !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterStatus('all');
              setFilterPhase('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Gantt Chart */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{format(dateRange.minDate, 'MMM d, yyyy')}</span>
            <span className="text-xs">Zoom: {zoomLevel}</span>
            <span>{format(dateRange.maxDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No tasks found. {ganttTasks.length === 0 ? 'Add your first task to get started.' : 'Try adjusting your filters.'}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const links = getLinkedEntityNames(task);
              const barStyle = getBarStyle(task.startDate, task.endDate);
              const phaseColor = task.phaseId ? phaseColors[task.phaseId as keyof typeof phaseColors] || 'bg-primary' : 'bg-primary';
              const statusColor = statusColors[task.status || 'not-started'];

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedTaskDetail(task)}
                >
              {/* Task Name */}
                  <div className="w-64 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {task.isMilestone && (
                    <span className="h-2 w-2 rotate-45 bg-warning" />
                  )}
                  <span className={cn(
                    "text-sm",
                        task.isMilestone ? "font-semibold text-foreground" : "text-foreground"
                  )}>
                    {task.name}
                  </span>
                </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                    )}
                    {links.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{links.length} link(s)</span>
                      </div>
                    )}
              </div>

              {/* Bar */}
                  <div className="relative h-10 flex-1 rounded bg-muted/50">
                {task.isMilestone ? (
                  <div
                        className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rotate-45 bg-warning shadow-md border-2 border-warning-foreground"
                        style={{ left: barStyle.left }}
                        title={task.name}
                  />
                ) : (
                      <>
                  <div
                    className={cn(
                      "absolute top-1 bottom-1 rounded shadow-sm transition-all",
                            phaseColor
                    )}
                          style={barStyle}
                          title={`${task.name}: ${task.progress}%`}
                  >
                    {/* Progress */}
                    <div 
                            className={cn(
                              "absolute inset-y-0 left-0 rounded",
                              statusColor,
                              "opacity-80"
                            )}
                      style={{ width: `${task.progress}%` }}
                    />
                          {/* Progress text */}
                          {task.progress > 10 && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                              {task.progress}%
                            </span>
                          )}
                        </div>
                        {/* Actual dates overlay if different */}
                        {task.actualStartDate && task.actualStartDate !== task.startDate && (
                          <div
                            className="absolute top-0 h-1 bg-red-500"
                            style={{
                              left: `${(differenceInDays(parseISO(task.actualStartDate), dateRange.minDate) / dateRange.totalDays) * 100}%`,
                              width: '2px',
                            }}
                            title={`Actual start: ${format(parseISO(task.actualStartDate), 'MMM d')}`}
                          />
                        )}
                      </>
                    )}
                    {/* Dependencies arrows */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
                        <div className="h-0.5 w-2 bg-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="w-32 flex-shrink-0 text-right space-y-1">
                    <div className="text-sm font-medium text-foreground">{task.progress}%</div>
                    <div className="flex items-center justify-end gap-2">
                      {task.status && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.status}
                        </Badge>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span className="truncate max-w-[60px]">{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                    {task.budget && (
                      <div className="text-xs text-muted-foreground">
                        ${task.budget.toLocaleString()}
                  </div>
                )}
              </div>

                  {/* Actions */}
                  <div className="w-24 flex-shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                    >
                      Delete
                    </Button>
              </div>
            </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTaskDetail} onOpenChange={(open) => !open && setSelectedTaskDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTaskDetail?.name}</DialogTitle>
            <DialogDescription>{selectedTaskDetail?.description}</DialogDescription>
          </DialogHeader>
          {selectedTaskDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="dates">Dates</TabsTrigger>
                <TabsTrigger value="resources">Resources & Cost</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedTaskDetail.type || 'task'}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedTaskDetail.status || 'not-started'}
                    </Badge>
                  </div>
                  <div>
                    <Label>Progress</Label>
                    <div className="text-2xl font-bold mt-1">{selectedTaskDetail.progress}%</div>
                  </div>
                  <div>
                    <Label>Phase</Label>
                    <p className="text-sm mt-1">
                      {selectedTaskDetail.phaseId 
                        ? phases.find(p => p.id === selectedTaskDetail.phaseId)?.name || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedTaskDetail.assignedTo && (
                  <div>
                    <Label>Assigned To</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {selectedTaskDetail.assignedTo}
                    </p>
                  </div>
                )}
                {selectedTaskDetail.resources && selectedTaskDetail.resources.length > 0 && (
                  <div>
                    <Label>Resources</Label>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {selectedTaskDetail.resources.map((resource, idx) => (
                        <li key={idx} className="text-sm">{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="dates" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Planned Start</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(selectedTaskDetail.startDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label>Planned End</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(selectedTaskDetail.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {selectedTaskDetail.actualStartDate && (
                    <div>
                      <Label>Actual Start</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(parseISO(selectedTaskDetail.actualStartDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {selectedTaskDetail.actualEndDate && (
                    <div>
                      <Label>Actual End</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(parseISO(selectedTaskDetail.actualEndDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                {selectedTaskDetail.dependencies && selectedTaskDetail.dependencies.length > 0 && (
                  <div>
                    <Label>Dependencies</Label>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {selectedTaskDetail.dependencies.map((depId) => {
                        const dep = filteredTasks.find(t => t.id === depId) || ganttTasks.find(t => t.id === depId);
                        return dep ? (
                          <li key={depId} className="text-sm">{dep.name}</li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedTaskDetail.budget && (
                    <div>
                      <Label>Budget</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        ${selectedTaskDetail.budget.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedTaskDetail.actualCost && (
                    <div>
                      <Label>Actual Cost</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        ${selectedTaskDetail.actualCost.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedTaskDetail.budget && selectedTaskDetail.actualCost && (
                  <div>
                    <Label>Cost Variance</Label>
                    <p className={cn(
                      "text-sm mt-1 font-semibold",
                      selectedTaskDetail.actualCost > selectedTaskDetail.budget ? "text-red-600" : "text-green-600"
                    )}>
                      ${(selectedTaskDetail.actualCost - selectedTaskDetail.budget).toLocaleString()}
                      {selectedTaskDetail.actualCost > selectedTaskDetail.budget ? ' (Over budget)' : ' (Under budget)'}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="links" className="space-y-4">
                {getLinkedEntityNames(selectedTaskDetail).length > 0 ? (
                  <ul className="space-y-2">
                    {getLinkedEntityNames(selectedTaskDetail).map((link, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        {link}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No links defined</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Task Dialog */}
      <GanttTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        mode={dialogMode}
      />
    </div>
  );
}
