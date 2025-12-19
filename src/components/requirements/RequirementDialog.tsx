import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Requirement } from '@/types/project';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';

interface RequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirement?: Requirement | null;
  mode: 'add' | 'edit';
}

export function RequirementDialog({ open, onOpenChange, requirement, mode }: RequirementDialogProps) {
  const { 
    addRequirement, 
    updateRequirement,
    generateRequirementCode,
    requirements,
    phases,
    wbs,
    tasks,
    backlog,
    risks,
    stakeholders
  } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Requirement['type']>('functional');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<Requirement['status']>('draft');
  const [source, setSource] = useState('');
  const [sourceDocument, setSourceDocument] = useState('');
  const [rationale, setRationale] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState('');
  const [validationMethod, setValidationMethod] = useState<Requirement['validationMethod']>('testing');
  const [validationStatus, setValidationStatus] = useState<Requirement['validationStatus']>('not-started');
  const [validatedBy, setValidatedBy] = useState('');
  const [owner, setOwner] = useState('');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__none__');
  const [linkedBacklogItemIds, setLinkedBacklogItemIds] = useState<string[]>([]);
  const [selectedBacklogItemId, setSelectedBacklogItemId] = useState<string>('__none__');
  const [linkedWBSNodeIds, setLinkedWBSNodeIds] = useState<string[]>([]);
  const [selectedWBSNodeId, setSelectedWBSNodeId] = useState<string>('__none__');
  const [linkedPhaseIds, setLinkedPhaseIds] = useState<string[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('__none__');
  const [linkedStakeholderIds, setLinkedStakeholderIds] = useState<string[]>([]);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string>('__none__');
  const [linkedRiskIds, setLinkedRiskIds] = useState<string[]>([]);
  const [selectedRiskId, setSelectedRiskId] = useState<string>('__none__');
  const [parentRequirementId, setParentRequirementId] = useState<string>('__none__');
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string>('__none__');
  const [identifiedDate, setIdentifiedDate] = useState('');
  const [notes, setNotes] = useState('');

  const code = mode === 'add' ? generateRequirementCode(type) : requirement?.code || '';

  useEffect(() => {
    if (requirement && mode === 'edit') {
      setTitle(requirement.title);
      setDescription(requirement.description);
      setType(requirement.type);
      setPriority(requirement.priority);
      setStatus(requirement.status);
      setSource(requirement.source || '');
      setSourceDocument(requirement.sourceDocument || '');
      setRationale(requirement.rationale || '');
      setAcceptanceCriteria(requirement.acceptanceCriteria || []);
      setValidationMethod(requirement.validationMethod || 'testing');
      setValidationStatus(requirement.validationStatus || 'not-started');
      setValidatedBy(requirement.validatedBy || '');
      setOwner(requirement.owner || '');
      setLinkedTaskIds(requirement.linkedTasks || []);
      setLinkedBacklogItemIds(requirement.linkedBacklogItems || []);
      setLinkedWBSNodeIds(requirement.linkedWBSNodeIds || []);
      setLinkedPhaseIds(requirement.linkedPhaseIds || []);
      setLinkedStakeholderIds(requirement.linkedStakeholderIds || []);
      setLinkedRiskIds(requirement.linkedRiskIds || []);
      setParentRequirementId(requirement.parentRequirementId || '__none__');
      setDependencies(requirement.dependencies || []);
      setIdentifiedDate(requirement.identifiedDate || '');
      setNotes(requirement.notes || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setType('functional');
      setPriority('medium');
      setStatus('draft');
      setSource('');
      setSourceDocument('');
      setRationale('');
      setAcceptanceCriteria([]);
      setValidationMethod('testing');
      setValidationStatus('not-started');
      setValidatedBy('');
      setOwner('');
      setLinkedTaskIds([]);
      setLinkedBacklogItemIds([]);
      setLinkedWBSNodeIds([]);
      setLinkedPhaseIds([]);
      setLinkedStakeholderIds([]);
      setLinkedRiskIds([]);
      setParentRequirementId('__none__');
      setDependencies([]);
      setIdentifiedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [requirement, mode, open, generateRequirementCode, type]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please fill in required fields: Title');
      return;
    }

    const requirementData: Omit<Requirement, 'id' | 'code'> = {
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      source: source.trim() || undefined,
      sourceDocument: sourceDocument.trim() || undefined,
      rationale: rationale.trim() || undefined,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : undefined,
      validationMethod,
      validationStatus,
      validatedBy: validatedBy.trim() || undefined,
      owner: owner.trim() || undefined,
      linkedTasks: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedBacklogItems: linkedBacklogItemIds.length > 0 ? linkedBacklogItemIds : undefined,
      linkedWBSNodeIds: linkedWBSNodeIds.length > 0 ? linkedWBSNodeIds : undefined,
      linkedPhaseIds: linkedPhaseIds.length > 0 ? linkedPhaseIds : undefined,
      linkedStakeholderIds: linkedStakeholderIds.length > 0 ? linkedStakeholderIds : undefined,
      linkedRiskIds: linkedRiskIds.length > 0 ? linkedRiskIds : undefined,
      parentRequirementId: parentRequirementId !== '__none__' ? parentRequirementId : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      identifiedDate: identifiedDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    };

    if (mode === 'add') {
      addRequirement(requirementData);
    } else if (requirement) {
      updateRequirement(requirement.id, requirementData);
    }

    onOpenChange(false);
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([...acceptanceCriteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const removeCriterion = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
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
          <DialogTitle>{mode === 'add' ? 'Add Requirement' : 'Edit Requirement'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new requirement to the traceability matrix' : 'Update requirement information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="synchronization">Links</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <Label>Requirement Code</Label>
              <p className="text-sm font-mono text-primary mt-1">{code}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Requirement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed requirement description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Requirement['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="non-functional">Non-Functional</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high' | 'critical')}>
                  <SelectTrigger>
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
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Requirement['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="implemented">Implemented</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Requirement owner"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifiedDate">Identified Date</Label>
                <Input
                  id="identifiedDate"
                  type="date"
                  value={identifiedDate}
                  onChange={(e) => setIdentifiedDate(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., Stakeholder, Document, Regulation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceDocument">Source Document</Label>
                <Input
                  id="sourceDocument"
                  value={sourceDocument}
                  onChange={(e) => setSourceDocument(e.target.value)}
                  placeholder="Document reference"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale</Label>
              <Textarea
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why this requirement exists"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Acceptance Criteria</Label>
              <div className="flex gap-2">
                <Input
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="Add acceptance criterion"
                  onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                />
                <Button type="button" onClick={addCriterion} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {acceptanceCriteria.map((criterion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{criterion}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCriterion(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Parent Requirement</Label>
              <Select value={parentRequirementId} onValueChange={setParentRequirementId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {requirement ? requirements.filter(r => r.id !== requirement.id).map((req) => (
                    <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                  )) : requirements.map((req) => (
                    <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dependencies</Label>
              <div className="flex gap-2">
                <Select value={selectedDependencyId} onValueChange={setSelectedDependencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {requirement ? requirements.filter(r => r.id !== requirement.id && !dependencies.includes(r.id)).map((req) => (
                      <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                    )) : requirements.filter(r => !dependencies.includes(r.id)).map((req) => (
                      <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedDependencyId, setSelectedDependencyId, dependencies, setDependencies)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {dependencies.map((depId) => {
                  const dep = requirements.find(r => r.id === depId);
                  return dep ? (
                    <div key={depId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{dep.code} - {dep.title}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(dependencies, setDependencies, depId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validationMethod">Validation Method</Label>
                <Select value={validationMethod} onValueChange={(v) => setValidationMethod(v as Requirement['validationMethod'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="demonstration">Demonstration</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validationStatus">Validation Status</Label>
                <Select value={validationStatus} onValueChange={(v) => setValidationStatus(v as Requirement['validationStatus'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validatedBy">Validated By</Label>
              <Input
                id="validatedBy"
                value={validatedBy}
                onChange={(e) => setValidatedBy(e.target.value)}
                placeholder="Person or team who validated"
              />
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
              <Label>Linked Phases</Label>
              <div className="flex gap-2">
                <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {phases.filter(p => !linkedPhaseIds.includes(p.id)).map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedPhaseId, setSelectedPhaseId, linkedPhaseIds, setLinkedPhaseIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedPhaseIds.map((phaseId) => {
                  const phase = phases.find(p => p.id === phaseId);
                  return phase ? (
                    <div key={phaseId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{phase.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedPhaseIds, setLinkedPhaseIds, phaseId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linked Stakeholders</Label>
              <div className="flex gap-2">
                <Select value={selectedStakeholderId} onValueChange={setSelectedStakeholderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stakeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {stakeholders.filter(s => !linkedStakeholderIds.includes(s.id)).map((stakeholder) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>{stakeholder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => addLinkedItem(selectedStakeholderId, setSelectedStakeholderId, linkedStakeholderIds, setLinkedStakeholderIds)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedStakeholderIds.map((stakeholderId) => {
                  const stakeholder = stakeholders.find(s => s.id === stakeholderId);
                  return stakeholder ? (
                    <div key={stakeholderId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{stakeholder.name}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkedItem(linkedStakeholderIds, setLinkedStakeholderIds, stakeholderId)}>
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
            {mode === 'add' ? 'Add Requirement' : 'Update Requirement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

