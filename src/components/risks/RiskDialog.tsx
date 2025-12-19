import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Risk, RiskCategory, RiskProbability, RiskImpact, RiskResponseStrategy, RiskStatus, RiskAction } from '@/types/project';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Trash2 } from 'lucide-react';
import { projectRoles, agileRoles } from '@/data/projectData';

interface RiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: Risk | null;
  mode: 'add' | 'edit';
}

export function RiskDialog({ open, onOpenChange, risk, mode }: RiskDialogProps) {
  const { 
    addRisk, 
    updateRisk, 
    calculateRiskScore, 
    phases, 
    wbs, 
    tasks, 
    mode: projectMode 
  } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RiskCategory>('other');
  const [probability, setProbability] = useState<RiskProbability>('medium');
  const [impact, setImpact] = useState<RiskImpact>('medium');
  const [rootCauses, setRootCauses] = useState<string[]>([]);
  const [newRootCause, setNewRootCause] = useState('');
  const [effects, setEffects] = useState<string[]>([]);
  const [newEffect, setNewEffect] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [response, setResponse] = useState<RiskResponseStrategy>('mitigate');
  const [responsePlan, setResponsePlan] = useState('');
  const [responseActions, setResponseActions] = useState<RiskAction[]>([]);
  const [newActionDescription, setNewActionDescription] = useState('');
  const [newActionOwner, setNewActionOwner] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<RiskStatus>('identified');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [responseCost, setResponseCost] = useState('');
  const [residualRisk, setResidualRisk] = useState('');
  const [linkedPhaseId, setLinkedPhaseId] = useState<string>('__none__');
  const [linkedWBSNodeId, setLinkedWBSNodeId] = useState<string>('__none__');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__none__');
  const [identifiedDate, setIdentifiedDate] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [notes, setNotes] = useState('');

  const roles = projectMode === 'waterfall' ? projectRoles : agileRoles;
  const calculatedScore = calculateRiskScore(probability, impact);

  useEffect(() => {
    if (risk && mode === 'edit') {
      setTitle(risk.title);
      setDescription(risk.description);
      setCategory(risk.category || 'other');
      setProbability(risk.probability);
      setImpact(risk.impact);
      setRootCauses(risk.rootCauses || []);
      setEffects(risk.effects || []);
      setTriggers(risk.triggers || []);
      setResponse(risk.response);
      setResponsePlan(risk.responsePlan || '');
      setResponseActions(risk.responseActions || []);
      setOwner(risk.owner);
      setStatus(risk.status);
      setEstimatedCost(risk.estimatedCost?.toString() || '');
      setResponseCost(risk.responseCost?.toString() || '');
      setResidualRisk(risk.residualRisk || '');
      setLinkedPhaseId(risk.linkedPhaseId || '__none__');
      setLinkedWBSNodeId(risk.linkedWBSNodeId || '__none__');
      setLinkedTaskIds(risk.linkedTaskIds || []);
      setIdentifiedDate(risk.identifiedDate || '');
      setNextReviewDate(risk.nextReviewDate || '');
      setNotes(risk.notes || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('other');
      setProbability('medium');
      setImpact('medium');
      setRootCauses([]);
      setEffects([]);
      setTriggers([]);
      setResponse('mitigate');
      setResponsePlan('');
      setResponseActions([]);
      setOwner('');
      setStatus('identified');
      setEstimatedCost('');
      setResponseCost('');
      setResidualRisk('');
      setLinkedPhaseId('__none__');
      setLinkedWBSNodeId('__none__');
      setLinkedTaskIds([]);
      setIdentifiedDate(new Date().toISOString().split('T')[0]);
      setNextReviewDate('');
      setNotes('');
    }
  }, [risk, mode, open]);

  const handleSave = () => {
    if (!title.trim() || !owner.trim()) {
      alert('Please fill in required fields: Title and Owner');
      return;
    }

    const riskData: Omit<Risk, 'id' | 'score'> = {
      title: title.trim(),
      description: description.trim(),
      category,
      probability,
      impact,
      rootCauses: rootCauses.length > 0 ? rootCauses : undefined,
      effects: effects.length > 0 ? effects : undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
      response,
      responsePlan: responsePlan.trim() || undefined,
      responseActions: responseActions.length > 0 ? responseActions : undefined,
      owner: owner.trim(),
      status,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      responseCost: responseCost ? parseFloat(responseCost) : undefined,
      residualRisk: residualRisk.trim() || undefined,
      linkedPhaseId: linkedPhaseId !== '__none__' ? linkedPhaseId : undefined,
      linkedWBSNodeId: linkedWBSNodeId !== '__none__' ? linkedWBSNodeId : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      identifiedDate: identifiedDate || new Date().toISOString().split('T')[0],
      nextReviewDate: nextReviewDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (mode === 'add') {
      addRisk(riskData);
    } else if (risk) {
      updateRisk(risk.id, riskData);
    }

    onOpenChange(false);
  };

  const addRootCause = () => {
    if (newRootCause.trim()) {
      setRootCauses([...rootCauses, newRootCause.trim()]);
      setNewRootCause('');
    }
  };

  const removeRootCause = (index: number) => {
    setRootCauses(rootCauses.filter((_, i) => i !== index));
  };

  const addEffect = () => {
    if (newEffect.trim()) {
      setEffects([...effects, newEffect.trim()]);
      setNewEffect('');
    }
  };

  const removeEffect = (index: number) => {
    setEffects(effects.filter((_, i) => i !== index));
  };

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setTriggers([...triggers, newTrigger.trim()]);
      setNewTrigger('');
    }
  };

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const addAction = () => {
    if (newActionDescription.trim() && newActionOwner.trim()) {
      const newAction: RiskAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: newActionDescription.trim(),
        owner: newActionOwner.trim(),
        dueDate: newActionDueDate || undefined,
        status: 'not-started',
      };
      setResponseActions([...responseActions, newAction]);
      setNewActionDescription('');
      setNewActionOwner('');
      setNewActionDueDate('');
    }
  };

  const removeAction = (actionId: string) => {
    setResponseActions(responseActions.filter(a => a.id !== actionId));
  };

  const updateActionStatus = (actionId: string, newStatus: RiskAction['status']) => {
    setResponseActions(responseActions.map(a =>
      a.id === actionId
        ? { ...a, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined }
        : a
    ));
  };

  const addLinkedTask = () => {
    if (selectedTaskId !== '__none__' && !linkedTaskIds.includes(selectedTaskId)) {
      setLinkedTaskIds([...linkedTaskIds, selectedTaskId]);
      setSelectedTaskId('__none__');
    }
  };

  const removeLinkedTask = (taskId: string) => {
    setLinkedTaskIds(linkedTaskIds.filter(id => id !== taskId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Risk' : 'Edit Risk'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new risk to the register' : 'Update risk information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="synchronization">Links</TabsTrigger>
            <TabsTrigger value="dates">Dates & Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Risk title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed risk description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as RiskCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="organizational">Organizational</SelectItem>
                    <SelectItem value="project-management">Project Management</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="scope">Scope</SelectItem>
                    <SelectItem value="stakeholder">Stakeholder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Owner *</Label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Probability</Label>
                <Select value={probability} onValueChange={(v) => setProbability(v as RiskProbability)}>
                  <SelectTrigger>
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
                <Label htmlFor="impact">Impact</Label>
                <Select value={impact} onValueChange={(v) => setImpact(v as RiskImpact)}>
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
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Label>Risk Score</Label>
                <Badge className="text-lg px-4 py-2">
                  {calculatedScore}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as RiskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="analyzing">Analyzing</SelectItem>
                    <SelectItem value="mitigating">Mitigating</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="occurred">Occurred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Root Causes</Label>
              <div className="flex gap-2">
                <Input
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  placeholder="Add root cause"
                  onKeyPress={(e) => e.key === 'Enter' && addRootCause()}
                />
                <Button type="button" onClick={addRootCause} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {rootCauses.map((cause, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{cause}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRootCause(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Effects/Consequences</Label>
              <div className="flex gap-2">
                <Input
                  value={newEffect}
                  onChange={(e) => setNewEffect(e.target.value)}
                  placeholder="Add effect"
                  onKeyPress={(e) => e.key === 'Enter' && addEffect()}
                />
                <Button type="button" onClick={addEffect} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {effects.map((effect, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{effect}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEffect(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Triggers/Early Warning Indicators</Label>
              <div className="flex gap-2">
                <Input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Add trigger"
                  onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                />
                <Button type="button" onClick={addTrigger} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{trigger}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrigger(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="response">Response Strategy</Label>
              <Select value={response} onValueChange={(v) => setResponse(v as RiskResponseStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avoid">Avoid</SelectItem>
                  <SelectItem value="mitigate">Mitigate</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="accept">Accept</SelectItem>
                  <SelectItem value="exploit">Exploit (Opportunity)</SelectItem>
                  <SelectItem value="enhance">Enhance (Opportunity)</SelectItem>
                  <SelectItem value="share">Share (Opportunity)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsePlan">Response Plan</Label>
              <Textarea
                id="responsePlan"
                value={responsePlan}
                onChange={(e) => setResponsePlan(e.target.value)}
                placeholder="Detailed response plan"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Response Actions</Label>
              <div className="space-y-2 border border-border rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={newActionDescription}
                    onChange={(e) => setNewActionDescription(e.target.value)}
                    placeholder="Action description"
                  />
                  <Select value={newActionOwner} onValueChange={setNewActionOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={newActionDueDate}
                      onChange={(e) => setNewActionDueDate(e.target.value)}
                      placeholder="Due date"
                    />
                    <Button type="button" onClick={addAction} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {responseActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.owner} • {action.dueDate ? `Due: ${action.dueDate}` : 'No due date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={action.status}
                        onValueChange={(v) => updateActionStatus(action.id, v as RiskAction['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseCost">Response Cost ($)</Label>
                <Input
                  id="responseCost"
                  type="number"
                  value={responseCost}
                  onChange={(e) => setResponseCost(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="residualRisk">Residual Risk</Label>
              <Textarea
                id="residualRisk"
                value={residualRisk}
                onChange={(e) => setResidualRisk(e.target.value)}
                placeholder="Description of residual risk after response"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="synchronization" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="linkedPhase">Linked Phase</Label>
              <Select value={linkedPhaseId} onValueChange={setLinkedPhaseId}>
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
              <Label htmlFor="linkedWBS">Linked WBS Node</Label>
              <Select value={linkedWBSNodeId} onValueChange={setLinkedWBSNodeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {wbs.map((node) => (
                    <SelectItem key={node.id} value={node.id}>{node.code} - {node.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <Button type="button" onClick={addLinkedTask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {linkedTaskIds.map((taskId) => {
                  const task = tasks.find(t => t.id === taskId);
                  return task ? (
                    <div key={taskId} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                      <span className="text-sm">{task.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLinkedTask(taskId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identifiedDate">Identified Date</Label>
                <Input
                  id="identifiedDate"
                  type="date"
                  value={identifiedDate}
                  onChange={(e) => setIdentifiedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextReviewDate">Next Review Date</Label>
                <Input
                  id="nextReviewDate"
                  type="date"
                  value={nextReviewDate}
                  onChange={(e) => setNextReviewDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Add Risk' : 'Update Risk'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

