import { useState, useEffect, useMemo } from 'react';
import { WBSNode } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus, Link2, FileText, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WBSNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node?: WBSNode | null;
  wbsNodes?: WBSNode[];
  phases?: { id: string; name: string }[];
  tasks?: { id: string; title: string }[];
  backlogItems?: { id: string; title: string }[];
  requirements?: { id: string; title: string }[];
  risks?: { id: string; title: string }[];
  onSave: (node: Omit<WBSNode, 'id' | 'code' | 'level' | 'children'>, parentId?: string) => void;
  mode: 'add' | 'edit';
}

const statusOptions = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function WBSNodeDialog({ 
  open, 
  onOpenChange, 
  node, 
  wbsNodes = [],
  phases = [],
  tasks = [],
  backlogItems = [],
  requirements = [],
  risks = [],
  onSave, 
  mode 
}: WBSNodeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phaseId, setPhaseId] = useState('__none__');
  const [responsible, setResponsible] = useState('');
  const [budget, setBudget] = useState<number | undefined>();
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'>('not-started');
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedBacklogItems, setSelectedBacklogItems] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [parentId, setParentId] = useState<string>('__root__');

  useEffect(() => {
    if (node && mode === 'edit') {
      setName(node.name || '');
      setDescription(node.description || '');
      setPhaseId(node.phaseId || '__none__');
      setResponsible(node.responsible || '');
      setBudget(node.budget);
      setEstimatedHours(node.estimatedHours);
      setStartDate(node.startDate ? new Date(node.startDate) : undefined);
      setEndDate(node.endDate ? new Date(node.endDate) : undefined);
      setStatus(node.status || 'not-started');
      setProgress(node.progress || 0);
      setMilestones(node.milestones || false);
      setSelectedTasks(node.linkedTasks || []);
      setSelectedBacklogItems(node.linkedBacklogItems || []);
      setSelectedRequirements(node.linkedRequirements || []);
      setSelectedRisks(node.linkedRisks || []);
      setDeliverables(node.deliverables || []);
      setParentId(node.parentId || '__root__');
    } else {
      // Reset for add mode
      setName('');
      setDescription('');
      setPhaseId('__none__');
      setResponsible('');
      setBudget(undefined);
      setEstimatedHours(undefined);
      setStartDate(undefined);
      setEndDate(undefined);
      setStatus('not-started');
      setProgress(0);
      setMilestones(false);
      setSelectedTasks([]);
      setSelectedBacklogItems([]);
      setSelectedRequirements([]);
      setSelectedRisks([]);
      setDeliverables([]);
      setParentId('__root__');
    }
    setNewDeliverable('');
  }, [node, mode, open]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleBacklogItem = (itemId: string) => {
    setSelectedBacklogItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleRequirement = (reqId: string) => {
    setSelectedRequirements(prev =>
      prev.includes(reqId)
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const toggleRisk = (riskId: string) => {
    setSelectedRisks(prev =>
      prev.includes(riskId)
        ? prev.filter(id => id !== riskId)
        : [...prev, riskId]
    );
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    const nodeData = {
      name: name.trim(),
      description: description.trim(),
      phaseId: phaseId && phaseId !== '__none__' ? phaseId : undefined,
      responsible: responsible || undefined,
      budget,
      estimatedHours,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      status,
      progress,
      milestones,
      linkedTasks: selectedTasks,
      linkedBacklogItems: selectedBacklogItems,
      linkedRequirements: selectedRequirements,
      linkedRisks: selectedRisks,
      deliverables,
    };

    if (mode === 'add') {
      const finalParentId = parentId && parentId !== '__root__' ? parentId : undefined;
      onSave(nodeData, finalParentId);
    } else {
      onSave(nodeData);
    }
    
    onOpenChange(false);
  };

  const availableParents = useMemo(() => {
    return wbsNodes.filter(n => !n.parentId || (n.level !== undefined && n.level < 3));
  }, [wbsNodes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add WBS Node' : 'Edit WBS Node'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="resources">Resources & Budget</TabsTrigger>
            <TabsTrigger value="synchronization">Synchronization</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mode === 'add' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parent">Parent Node (Optional)</Label>
                  <Select value={parentId || '__root__'} onValueChange={setParentId}>
                    <SelectTrigger id="parent">
                      <SelectValue placeholder="Select parent node (or leave empty for root)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__root__">Root Level</SelectItem>
                      {availableParents.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.code} - {n.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter WBS node name..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the work package..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phase">Phase</Label>
                <Select value={phaseId || '__none__'} onValueChange={setPhaseId}>
                  <SelectTrigger id="phase">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {phases.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsible</Label>
                <Input
                  id="responsible"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Person or role responsible..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">
                  Progress ({progress}%)
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="milestone"
                    checked={milestones}
                    onCheckedChange={(checked) => setMilestones(checked === true)}
                  />
                  <Label htmlFor="milestone" className="cursor-pointer">
                    This is a milestone
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </div>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget || ''}
                  onChange={(e) => setBudget(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </div>
                </Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours || ''}
                  onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-4">
                      <Input
                        type="date"
                        value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-4">
                      <Input
                        type="date"
                        value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synchronization" className="space-y-4 mt-4">
            <div className="space-y-6">
              {/* Linked Tasks */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked Tasks
                </Label>
                <div className="rounded-lg border border-border p-3 max-h-40 overflow-y-auto space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks available</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <Label className="text-sm cursor-pointer flex-1">{task.title}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Linked Backlog Items */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked Backlog Items
                </Label>
                <div className="rounded-lg border border-border p-3 max-h-40 overflow-y-auto space-y-2">
                  {backlogItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No backlog items available</p>
                  ) : (
                    backlogItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBacklogItems.includes(item.id)}
                          onCheckedChange={() => toggleBacklogItem(item.id)}
                        />
                        <Label className="text-sm cursor-pointer flex-1">{item.title}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Linked Requirements */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked Requirements
                </Label>
                <div className="rounded-lg border border-border p-3 max-h-40 overflow-y-auto space-y-2">
                  {requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No requirements available</p>
                  ) : (
                    requirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedRequirements.includes(req.id)}
                          onCheckedChange={() => toggleRequirement(req.id)}
                        />
                        <Label className="text-sm cursor-pointer flex-1">{req.title}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Linked Risks */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Linked Risks
                </Label>
                <div className="rounded-lg border border-border p-3 max-h-40 overflow-y-auto space-y-2">
                  {risks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No risks available</p>
                  ) : (
                    risks.map((risk) => (
                      <div key={risk.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedRisks.includes(risk.id)}
                          onCheckedChange={() => toggleRisk(risk.id)}
                        />
                        <Label className="text-sm cursor-pointer flex-1">{risk.title}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Deliverables</Label>
              <div className="flex gap-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                  placeholder="Add a deliverable..."
                />
                <Button type="button" size="icon" onClick={addDeliverable}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{deliverable}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !description.trim()}>
            {mode === 'add' ? 'Add Node' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

