import { useState, useEffect } from 'react';
import { BacklogItem, BacklogItemType, BacklogItemStatus, MoSCoW, UserStory, AcceptanceCriterion } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BacklogItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BacklogItem | null;
  backlogItems?: BacklogItem[]; // For dependencies and epic selection
  onSave: (item: Omit<BacklogItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  mode: 'add' | 'edit';
}

const typeOptions: { value: BacklogItemType; label: string }[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'feature', label: 'Feature' },
  { value: 'story', label: 'User Story' },
  { value: 'bug', label: 'Bug' },
  { value: 'technical', label: 'Technical' },
  { value: 'spike', label: 'Spike' },
];

const statusOptions: { value: BacklogItemStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'refined', label: 'Refined' },
  { value: 'ready', label: 'Ready' },
  { value: 'in-sprint', label: 'In Sprint' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
];

const moscowOptions: { value: MoSCoW; label: string }[] = [
  { value: 'must-have', label: 'Must Have' },
  { value: 'should-have', label: 'Should Have' },
  { value: 'could-have', label: 'Could Have' },
  { value: 'won\'t-have', label: 'Won\'t Have' },
];

const tShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export function BacklogItemDialog({ open, onOpenChange, item, backlogItems = [], onSave, mode }: BacklogItemDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BacklogItemType>('story');
  const [status, setStatus] = useState<BacklogItemStatus>('draft');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [moscow, setMoscow] = useState<MoSCoW>('should-have');
  const [businessValue, setBusinessValue] = useState(5);
  const [effort, setEffort] = useState(5);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [storyPoints, setStoryPoints] = useState<number | undefined>();
  const [tShirtSize, setTShirtSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | undefined>();
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [userStory, setUserStory] = useState<UserStory>({ asA: '', iWant: '', soThat: '' });
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriterion[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [definitionOfReady, setDefinitionOfReady] = useState<string[]>([]);
  const [newDoRItem, setNewDoRItem] = useState('');
  const [definitionOfDone, setDefinitionOfDone] = useState<string[]>([]);
  const [newDoDItem, setNewDoDItem] = useState('');
  const [businessJustification, setBusinessJustification] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item && mode === 'edit') {
      setTitle(item.title);
      setDescription(item.description);
      setType(item.type);
      setStatus(item.status);
      setPriority(item.priority);
      setMoscow(item.moscow || 'should-have');
      setBusinessValue(item.businessValue || 5);
      setEffort(item.effort || 5);
      setRisk(item.risk || 'medium');
      setStoryPoints(item.storyPoints);
      setTShirtSize(item.tShirtSize);
      setEstimatedHours(item.estimatedHours);
      setUserStory(item.userStory || { asA: '', iWant: '', soThat: '' });
      setAcceptanceCriteria(Array.isArray(item.acceptanceCriteria) ? item.acceptanceCriteria : []);
      setDefinitionOfReady(Array.isArray(item.definitionOfReady) ? item.definitionOfReady : []);
      setDefinitionOfDone(Array.isArray(item.definitionOfDone) ? item.definitionOfDone : []);
      setBusinessJustification(item.businessJustification || '');
      setNotes(item.notes || '');
    } else {
      // Reset for add mode
      setTitle('');
      setDescription('');
      setType('story');
      setStatus('draft');
      setPriority('medium');
      setMoscow('should-have');
      setBusinessValue(5);
      setEffort(5);
      setRisk('medium');
      setStoryPoints(undefined);
      setTShirtSize(undefined);
      setEstimatedHours(undefined);
      setUserStory({ asA: '', iWant: '', soThat: '' });
      setAcceptanceCriteria([]);
      setDefinitionOfReady([]);
      setDefinitionOfDone([]);
      setBusinessJustification('');
      setNotes('');
    }
    setNewCriterion('');
    setNewDoRItem('');
    setNewDoDItem('');
  }, [item, mode, open]);

  const addAcceptanceCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, {
        id: `ac-${Date.now()}`,
        description: newCriterion.trim(),
        verified: false,
      }]);
      setNewCriterion('');
    }
  };

  const removeAcceptanceCriterion = (id: string) => {
    setAcceptanceCriteria(acceptanceCriteria.filter(ac => ac.id !== id));
  };

  const addDoRItem = () => {
    if (newDoRItem.trim()) {
      setDefinitionOfReady([...definitionOfReady, newDoRItem.trim()]);
      setNewDoRItem('');
    }
  };

  const removeDoRItem = (index: number) => {
    setDefinitionOfReady(definitionOfReady.filter((_, i) => i !== index));
  };

  const addDoDItem = () => {
    if (newDoDItem.trim()) {
      setDefinitionOfDone([...definitionOfDone, newDoDItem.trim()]);
      setNewDoDItem('');
    }
  };

  const removeDoDItem = (index: number) => {
    setDefinitionOfDone(definitionOfDone.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      priority,
      moscow,
      businessValue: businessValue || undefined,
      effort: effort || undefined,
      risk: risk || undefined,
      storyPoints,
      tShirtSize,
      estimatedHours,
      userStory: (userStory.asA || userStory.iWant || userStory.soThat) ? userStory : undefined,
      acceptanceCriteria: (Array.isArray(acceptanceCriteria) && acceptanceCriteria.length > 0) ? acceptanceCriteria : undefined,
      tags: [],
      dependencies: [],
      definitionOfReady: (Array.isArray(definitionOfReady) && definitionOfReady.length > 0) ? definitionOfReady : undefined,
      definitionOfDone: (Array.isArray(definitionOfDone) && definitionOfDone.length > 0) ? definitionOfDone : undefined,
      refinementStatus: 'not-started',
      businessJustification: businessJustification || undefined,
      notes: notes || undefined,
      createdBy: item?.createdBy || 'current-user',
    });

    onOpenChange(false);
  };

  const valueEffortRatio = (businessValue && effort && effort > 0) ? businessValue / effort : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Create Backlog Item' : 'Edit Backlog Item'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="user-story">User Story</TabsTrigger>
            <TabsTrigger value="estimation">Estimation</TabsTrigger>
            <TabsTrigger value="prioritization">Prioritization</TabsTrigger>
            <TabsTrigger value="definition">Definition</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter backlog item title..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the backlog item..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as BacklogItemType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as BacklogItemStatus)}>
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
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk">Risk Level</Label>
                <Select value={risk} onValueChange={(value) => setRisk(value as any)}>
                  <SelectTrigger id="risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessJustification">Business Justification</Label>
                <Textarea
                  id="businessJustification"
                  value={businessJustification}
                  onChange={(e) => setBusinessJustification(e.target.value)}
                  placeholder="Explain the business value and justification..."
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="user-story" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="font-semibold mb-3">User Story Format</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="asA">As a...</Label>
                    <Input
                      id="asA"
                      value={userStory.asA}
                      onChange={(e) => setUserStory({ ...userStory, asA: e.target.value })}
                      placeholder="e.g., project manager, end user, administrator"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iWant">I want...</Label>
                    <Input
                      id="iWant"
                      value={userStory.iWant}
                      onChange={(e) => setUserStory({ ...userStory, iWant: e.target.value })}
                      placeholder="e.g., to view project dashboard"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soThat">So that...</Label>
                    <Input
                      id="soThat"
                      value={userStory.soThat}
                      onChange={(e) => setUserStory({ ...userStory, soThat: e.target.value })}
                      placeholder="e.g., I can track project progress"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Acceptance Criteria</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAcceptanceCriterion()}
                    placeholder="Add acceptance criterion..."
                  />
                  <Button type="button" size="icon" onClick={addAcceptanceCriterion}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {acceptanceCriteria && acceptanceCriteria.map((criterion) => (
                    <div key={criterion?.id || Math.random()} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{criterion?.description}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => criterion?.id && removeAcceptanceCriterion(criterion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="estimation" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="storyPoints">Story Points</Label>
                <Input
                  id="storyPoints"
                  type="number"
                  min="0"
                  value={storyPoints || ''}
                  onChange={(e) => setStoryPoints(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                <Select value={tShirtSize || ''} onValueChange={(value) => setTShirtSize(value as any)}>
                  <SelectTrigger id="tShirtSize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {tShirtSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
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
            </div>
          </TabsContent>

          <TabsContent value="prioritization" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="moscow">MoSCoW Priority</Label>
                <Select value={moscow} onValueChange={(value) => setMoscow(value as MoSCoW)}>
                  <SelectTrigger id="moscow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moscowOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk">Risk Level</Label>
                <Select value={risk} onValueChange={(value) => setRisk(value as any)}>
                  <SelectTrigger id="risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessValue">
                  Business Value (1-10)
                  <span className="ml-2 text-xs text-muted-foreground">Current: {businessValue}</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={businessValue}
                  onChange={(e) => setBusinessValue(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effort">
                  Effort (1-10)
                  <span className="ml-2 text-xs text-muted-foreground">Current: {effort}</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effort}
                  onChange={(e) => setEffort(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Value/Effort Matrix Visualization */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="font-semibold mb-2">Value/Effort Matrix</h3>
              <div className="grid grid-cols-10 gap-1 h-40 relative">
                {/* Matrix cells */}
                {Array.from({ length: 100 }).map((_, i) => {
                  const row = Math.floor(i / 10);
                  const col = i % 10;
                  const cellValue = 10 - row;
                  const cellEffort = col + 1;
                  const cellRatio = cellValue / cellEffort;
                  const isCurrent = cellValue === businessValue && cellEffort === effort;
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "border border-border text-[8px] flex items-center justify-center",
                        cellRatio > 1.5 && "bg-success/20",
                        cellRatio > 1 && cellRatio <= 1.5 && "bg-warning/20",
                        cellRatio <= 1 && "bg-destructive/20",
                        isCurrent && "ring-2 ring-primary"
                      )}
                      title={`Value: ${cellValue}, Effort: ${cellEffort}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Low Effort</span>
                <span>Value/Effort Ratio: {isNaN(valueEffortRatio) || !isFinite(valueEffortRatio) ? '0.00' : valueEffortRatio.toFixed(2)}</span>
                <span>High Effort</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="definition" className="space-y-4 mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Definition of Ready */}
              <div className="space-y-2">
                <Label>Definition of Ready</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDoRItem}
                    onChange={(e) => setNewDoRItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDoRItem()}
                    placeholder="Add DoR item..."
                  />
                  <Button type="button" size="icon" onClick={addDoRItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {definitionOfReady && definitionOfReady.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                      <Checkbox checked={false} />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeDoRItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Definition of Done */}
              <div className="space-y-2">
                <Label>Definition of Done</Label>
                <div className="flex gap-2">
                  <Input
                    value={newDoDItem}
                    onChange={(e) => setNewDoDItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDoDItem()}
                    placeholder="Add DoD item..."
                  />
                  <Button type="button" size="icon" onClick={addDoDItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {definitionOfDone && definitionOfDone.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                      <Checkbox checked={false} />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeDoDItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !description.trim()}>
            {mode === 'add' ? 'Create Item' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

