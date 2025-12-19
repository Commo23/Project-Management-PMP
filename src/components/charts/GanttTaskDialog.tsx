import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { GanttTask } from '@/types/project';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';

interface GanttTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: GanttTask | null;
  mode: 'add' | 'edit';
}

export function GanttTaskDialog({ open, onOpenChange, task, mode }: GanttTaskDialogProps) {
  const { 
    addGanttTask, 
    updateGanttTask,
    phases,
    tasks,
    wbs,
    backlog,
    requirements,
    risks,
    ganttTasks
  } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'task' | 'milestone' | 'summary' | 'phase'>('task');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [progress, setProgress] = useState('0');
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'>('not-started');
  const [phaseId, setPhaseId] = useState<string>('__none__');
  const [parentId, setParentId] = useState<string>('__none__');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string>('__none__');
  const [assignedTo, setAssignedTo] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [budget, setBudget] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__none__');
  const [linkedWBSNodeIds, setLinkedWBSNodeIds] = useState<string[]>([]);
  const [selectedWBSNodeId, setSelectedWBSNodeId] = useState<string>('__none__');
  const [linkedBacklogItemIds, setLinkedBacklogItemIds] = useState<string[]>([]);
  const [selectedBacklogItemId, setSelectedBacklogItemId] = useState<string>('__none__');
  const [linkedRequirementIds, setLinkedRequirementIds] = useState<string[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>('__none__');
  const [linkedRiskIds, setLinkedRiskIds] = useState<string[]>([]);
  const [selectedRiskId, setSelectedRiskId] = useState<string>('__none__');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (task && mode === 'edit') {
      setName(task.name);
      setDescription(task.description || '');
      setType(task.type || 'task');
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setActualStartDate(task.actualStartDate || '');
      setActualEndDate(task.actualEndDate || '');
      setProgress(task.progress.toString());
      setStatus(task.status || 'not-started');
      setPhaseId(task.phaseId || '__none__');
      setParentId(task.parentId || '__none__');
      setDependencies(task.dependencies || []);
      setAssignedTo(task.assignedTo || '');
      setResources(task.resources || []);
      setBudget(task.budget?.toString() || '');
      setActualCost(task.actualCost?.toString() || '');
      setLinkedTaskIds(task.linkedTaskIds || []);
      setLinkedWBSNodeIds(task.linkedWBSNodeIds || []);
      setLinkedBacklogItemIds(task.linkedBacklogItemIds || []);
      setLinkedRequirementIds(task.linkedRequirementIds || []);
      setLinkedRiskIds(task.linkedRiskIds || []);
      setNotes(task.notes || '');
    } else {
      // Reset form
      setName('');
      setDescription('');
      setType('task');
      setStartDate('');
      setEndDate('');
      setActualStartDate('');
      setActualEndDate('');
      setProgress('0');
      setStatus('not-started');
      setPhaseId('__none__');
      setParentId('__none__');
      setDependencies([]);
      setAssignedTo('');
      setResources([]);
      setBudget('');
      setActualCost('');
      setLinkedTaskIds([]);
      setLinkedWBSNodeIds([]);
      setLinkedBacklogItemIds([]);
      setLinkedRequirementIds([]);
      setLinkedRiskIds([]);
      setNotes('');
    }
  }, [task, mode, open]);

  const handleSave = () => {
    if (!name.trim() || !startDate || !endDate) {
      alert('Please fill in required fields: Name, Start Date, and End Date');
      return;
    }

    const taskData: Omit<GanttTask, 'id'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      startDate,
      endDate,
      actualStartDate: actualStartDate || undefined,
      actualEndDate: actualEndDate || undefined,
      progress: parseInt(progress) || 0,
      status,
      phaseId: phaseId !== '__none__' ? phaseId : undefined,
      parentId: parentId !== '__none__' ? parentId : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      assignedTo: assignedTo.trim() || undefined,
      resources: resources.length > 0 ? resources : undefined,
      budget: budget ? parseFloat(budget) : undefined,
      actualCost: actualCost ? parseFloat(actualCost) : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedWBSNodeIds: linkedWBSNodeIds.length > 0 ? linkedWBSNodeIds : undefined,
      linkedBacklogItemIds: linkedBacklogItemIds.length > 0 ? linkedBacklogItemIds : undefined,
      linkedRequirementIds: linkedRequirementIds.length > 0 ? linkedRequirementIds : undefined,
      linkedRiskIds: linkedRiskIds.length > 0 ? linkedRiskIds : undefined,
      notes: notes.trim() || undefined,
      isMilestone: type === 'milestone',
      isSummary: type === 'summary',
    };

    if (mode === 'add') {
      addGanttTask(taskData);
    } else if (task) {
      updateGanttTask(task.id, taskData);
    }

    onOpenChange(false);
  };

  const addResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addLinkedItem = (
    selectedId: string,
    setSelected: (id: string) => void,
    linkedIds: string[],
    setLinked: (ids: string[]) => void
  ) => {
    if (selectedId !== '__none__' && !linkedIds.includes(selectedId)) {
      setLinked([...linkedIds, selectedId]);
      setSelected('__none__');
    }
  };

  const removeLinkedItem = (linkedIds: string[], setLinked: (ids: string[]) => void, id: string) => {
    setLinked(linkedIds.filter(linkedId => linkedId !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Gantt Task' : 'Edit Gantt Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new task to the Gantt chart' : 'Update task information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="resources">Resources & Cost</TabsTrigger>
            <TabsTrigger value="synchronization">Links</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Task name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'task' | 'milestone' | 'summary' | 'phase')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="phase">Phase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={actualStartDate}
                  onChange={(e) => setActualStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Actual End Date</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  value={actualEndDate}
                  onChange={(e) => setActualEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phaseId">Phase</Label>
                <Select value={phaseId} onValueChange={setPhaseId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {phases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Task</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {task ? ganttTasks.filter(t => t.id !== task.id && (t.type === 'summary' || t.type === 'phase')).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    )) : ganttTasks.filter(t => t.type === 'summary' || t.type === 'phase').map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dependencies</Label>
              <div className="flex gap-2">
                <Select value={selectedDependencyId} onValueChange={setSelectedDependencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {task ? ganttTasks.filter(t => t.id !== task.id && !dependencies.includes(t.id)).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    )) : ganttTasks.filter(t => !dependencies.includes(t.id)).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedDependencyId, setSelectedDependencyId, dependencies, setDependencies)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {dependencies.map((depId) => {
                  const dep = ganttTasks.find(t => t.id === depId);
                  return dep ? (
                    <div key={depId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{dep.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(dependencies, setDependencies, depId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Person or role"
              />
            </div>

            <div className="space-y-2">
              <Label>Resources</Label>
              <div className="flex gap-2">
                <Input
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  placeholder="Add resource"
                  onKeyPress={(e) => e.key === 'Enter' && addResource()}
                />
                <Button type="button" onClick={addResource} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{resource}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualCost">Actual Cost ($)</Label>
                <Input
                  id="actualCost"
                  type="number"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synchronization" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Linked Tasks</Label>
              <div className="flex gap-2">
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {tasks.filter(t => !linkedTaskIds.includes(t.id)).map((task) => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedTaskId, setSelectedTaskId, linkedTaskIds, setLinkedTaskIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedTaskIds.map((taskId) => {
                  const task = tasks.find(t => t.id === taskId);
                  return task ? (
                    <div key={taskId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{task.title}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedTaskIds, setLinkedTaskIds, taskId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked WBS Nodes</Label>
              <div className="flex gap-2">
                <Select value={selectedWBSNodeId} onValueChange={setSelectedWBSNodeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select WBS node" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {wbs.filter(w => !linkedWBSNodeIds.includes(w.id)).map((node) => (
                      <SelectItem key={node.id} value={node.id}>{node.code} - {node.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedWBSNodeId, setSelectedWBSNodeId, linkedWBSNodeIds, setLinkedWBSNodeIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedWBSNodeIds.map((nodeId) => {
                  const node = wbs.find(w => w.id === nodeId);
                  return node ? (
                    <div key={nodeId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{node.code} - {node.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedWBSNodeIds, setLinkedWBSNodeIds, nodeId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked Backlog Items</Label>
              <div className="flex gap-2">
                <Select value={selectedBacklogItemId} onValueChange={setSelectedBacklogItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select backlog item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {backlog.filter(b => !linkedBacklogItemIds.includes(b.id)).map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedBacklogItemId, setSelectedBacklogItemId, linkedBacklogItemIds, setLinkedBacklogItemIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedBacklogItemIds.map((itemId) => {
                  const item = backlog.find(b => b.id === itemId);
                  return item ? (
                    <div key={itemId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{item.title}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedBacklogItemIds, setLinkedBacklogItemIds, itemId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked Requirements</Label>
              <div className="flex gap-2">
                <Select value={selectedRequirementId} onValueChange={setSelectedRequirementId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {requirements.filter(r => !linkedRequirementIds.includes(r.id)).map((req) => (
                      <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedRequirementId, setSelectedRequirementId, linkedRequirementIds, setLinkedRequirementIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedRequirementIds.map((reqId) => {
                  const req = requirements.find(r => r.id === reqId);
                  return req ? (
                    <div key={reqId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{req.code} - {req.title}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedRequirementIds, setLinkedRequirementIds, reqId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked Risks</Label>
              <div className="flex gap-2">
                <Select value={selectedRiskId} onValueChange={setSelectedRiskId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {risks.filter(r => !linkedRiskIds.includes(r.id)).map((risk) => (
                      <SelectItem key={risk.id} value={risk.id}>{risk.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedRiskId, setSelectedRiskId, linkedRiskIds, setLinkedRiskIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedRiskIds.map((riskId) => {
                  const risk = risks.find(r => r.id === riskId);
                  return risk ? (
                    <div key={riskId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{risk.title}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedRiskIds, setLinkedRiskIds, riskId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Add Task' : 'Update Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

