import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Stakeholder } from '@/types/project';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';

interface StakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder?: Stakeholder | null;
  mode: 'add' | 'edit';
}

export function StakeholderDialog({ open, onOpenChange, stakeholder, mode }: StakeholderDialogProps) {
  const { 
    addStakeholder, 
    updateStakeholder,
    phases,
    wbs,
    tasks,
    risks,
    requirements
  } = useProject();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [influence, setInfluence] = useState<'low' | 'medium' | 'high'>('medium');
  const [interest, setInterest] = useState<'low' | 'medium' | 'high'>('medium');
  const [engagementLevel, setEngagementLevel] = useState<'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading'>('neutral');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [newNeed, setNewNeed] = useState('');
  const [expectations, setExpectations] = useState<string[]>([]);
  const [newExpectation, setNewExpectation] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [newConcern, setNewConcern] = useState('');
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [engagementStrategy, setEngagementStrategy] = useState('');
  const [communicationPreferences, setCommunicationPreferences] = useState('');
  const [communicationFrequency, setCommunicationFrequency] = useState<'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed'>('weekly');
  const [linkedPhaseIds, setLinkedPhaseIds] = useState<string[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('__none__');
  const [linkedWBSNodeIds, setLinkedWBSNodeIds] = useState<string[]>([]);
  const [selectedWBSNodeId, setSelectedWBSNodeId] = useState<string>('__none__');
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__none__');
  const [linkedRiskIds, setLinkedRiskIds] = useState<string[]>([]);
  const [selectedRiskId, setSelectedRiskId] = useState<string>('__none__');
  const [linkedRequirementIds, setLinkedRequirementIds] = useState<string[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>('__none__');
  const [identifiedDate, setIdentifiedDate] = useState('');
  const [nextContactDate, setNextContactDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (stakeholder && mode === 'edit') {
      setName(stakeholder.name);
      setRole(stakeholder.role);
      setOrganization(stakeholder.organization);
      setInfluence(stakeholder.influence);
      setInterest(stakeholder.interest);
      setEngagementLevel(stakeholder.engagementLevel);
      setEmail(stakeholder.email || '');
      setPhone(stakeholder.phone || '');
      setAddress(stakeholder.address || '');
      setNeeds(stakeholder.needs || []);
      setExpectations(stakeholder.expectations || []);
      setConcerns(stakeholder.concerns || []);
      setRequirementsList(stakeholder.requirements || []);
      setEngagementStrategy(stakeholder.engagementStrategy || '');
      setCommunicationPreferences(stakeholder.communicationPreferences || '');
      setCommunicationFrequency(stakeholder.communicationFrequency || 'weekly');
      setLinkedPhaseIds(stakeholder.linkedPhaseIds || []);
      setLinkedWBSNodeIds(stakeholder.linkedWBSNodeIds || []);
      setLinkedTaskIds(stakeholder.linkedTaskIds || []);
      setLinkedRiskIds(stakeholder.linkedRiskIds || []);
      setLinkedRequirementIds(stakeholder.linkedRequirementIds || []);
      setIdentifiedDate(stakeholder.identifiedDate || '');
      setNextContactDate(stakeholder.nextContactDate || '');
      setNotes(stakeholder.notes || '');
    } else {
      // Reset form
      setName('');
      setRole('');
      setOrganization('');
      setInfluence('medium');
      setInterest('medium');
      setEngagementLevel('neutral');
      setEmail('');
      setPhone('');
      setAddress('');
      setNeeds([]);
      setExpectations([]);
      setConcerns([]);
      setRequirementsList([]);
      setEngagementStrategy('');
      setCommunicationPreferences('');
      setCommunicationFrequency('weekly');
      setLinkedPhaseIds([]);
      setLinkedWBSNodeIds([]);
      setLinkedTaskIds([]);
      setLinkedRiskIds([]);
      setLinkedRequirementIds([]);
      setIdentifiedDate(new Date().toISOString().split('T')[0]);
      setNextContactDate('');
      setNotes('');
    }
  }, [stakeholder, mode, open]);

  const handleSave = () => {
    if (!name.trim() || !role.trim() || !organization.trim()) {
      alert('Please fill in required fields: Name, Role, and Organization');
      return;
    }

    const stakeholderData: Omit<Stakeholder, 'id'> = {
      name: name.trim(),
      role: role.trim(),
      organization: organization.trim(),
      influence,
      interest,
      engagementLevel,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      needs: needs.length > 0 ? needs : undefined,
      expectations: expectations.length > 0 ? expectations : undefined,
      concerns: concerns.length > 0 ? concerns : undefined,
      requirements: requirementsList.length > 0 ? requirementsList : undefined,
      engagementStrategy: engagementStrategy.trim() || undefined,
      communicationPreferences: communicationPreferences.trim() || undefined,
      communicationFrequency,
      linkedPhaseIds: linkedPhaseIds.length > 0 ? linkedPhaseIds : undefined,
      linkedWBSNodeIds: linkedWBSNodeIds.length > 0 ? linkedWBSNodeIds : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedRiskIds: linkedRiskIds.length > 0 ? linkedRiskIds : undefined,
      linkedRequirementIds: linkedRequirementIds.length > 0 ? linkedRequirementIds : undefined,
      identifiedDate: identifiedDate || new Date().toISOString().split('T')[0],
      nextContactDate: nextContactDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (mode === 'add') {
      addStakeholder(stakeholderData);
    } else if (stakeholder) {
      updateStakeholder(stakeholder.id, stakeholderData);
    }

    onOpenChange(false);
  };

  const addItem = (list: string[], setList: (items: string[]) => void, newItem: string, setNewItem: (item: string) => void) => {
    if (newItem.trim()) {
      setList([...list, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addLinkedItem = (
    selectedId: string,
    setSelected: (id: string) => void,
    linkedIds: string[],
    setLinked: (ids: string[]) => void,
    placeholder: string
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
          <DialogTitle>{mode === 'add' ? 'Add Stakeholder' : 'Edit Stakeholder'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new stakeholder to the register' : 'Update stakeholder information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="needs">Needs & Expectations</TabsTrigger>
            <TabsTrigger value="synchronization">Links</TabsTrigger>
            <TabsTrigger value="dates">Dates & Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Stakeholder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Stakeholder role"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization name"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="influence">Influence</Label>
                <Select value={influence} onValueChange={(v) => setInfluence(v as 'low' | 'medium' | 'high')}>
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
                <Label htmlFor="interest">Interest</Label>
                <Select value={interest} onValueChange={(v) => setInterest(v as 'low' | 'medium' | 'high')}>
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
                <Label htmlFor="engagementLevel">Engagement Level</Label>
                <Select value={engagementLevel} onValueChange={(v) => setEngagementLevel(v as 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unaware">Unaware</SelectItem>
                    <SelectItem value="resistant">Resistant</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                    <SelectItem value="leading">Leading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Physical address"
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="engagementStrategy">Engagement Strategy</Label>
              <Textarea
                id="engagementStrategy"
                value={engagementStrategy}
                onChange={(e) => setEngagementStrategy(e.target.value)}
                placeholder="Strategy for engaging this stakeholder"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communicationPreferences">Communication Preferences</Label>
                <Input
                  id="communicationPreferences"
                  value={communicationPreferences}
                  onChange={(e) => setCommunicationPreferences(e.target.value)}
                  placeholder="e.g., Email, Meetings, Slack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="communicationFrequency">Communication Frequency</Label>
                <Select value={communicationFrequency} onValueChange={(v) => setCommunicationFrequency(v as 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="needs" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Needs</Label>
              <div className="flex gap-2">
                <Input
                  value={newNeed}
                  onChange={(e) => setNewNeed(e.target.value)}
                  placeholder="Add need"
                  onKeyPress={(e) => e.key === 'Enter' && addItem(needs, setNeeds, newNeed, setNewNeed)}
                />
                <Button type="button" onClick={() => addItem(needs, setNeeds, newNeed, setNewNeed)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {needs.map((need, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{need}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(needs, setNeeds, index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expectations</Label>
              <div className="flex gap-2">
                <Input
                  value={newExpectation}
                  onChange={(e) => setNewExpectation(e.target.value)}
                  placeholder="Add expectation"
                  onKeyPress={(e) => e.key === 'Enter' && addItem(expectations, setExpectations, newExpectation, setNewExpectation)}
                />
                <Button type="button" onClick={() => addItem(expectations, setExpectations, newExpectation, setNewExpectation)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {expectations.map((expectation, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{expectation}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(expectations, setExpectations, index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Concerns</Label>
              <div className="flex gap-2">
                <Input
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  placeholder="Add concern"
                  onKeyPress={(e) => e.key === 'Enter' && addItem(concerns, setConcerns, newConcern, setNewConcern)}
                />
                <Button type="button" onClick={() => addItem(concerns, setConcerns, newConcern, setNewConcern)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {concerns.map((concern, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{concern}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(concerns, setConcerns, index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Requirements</Label>
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add requirement"
                  onKeyPress={(e) => e.key === 'Enter' && addItem(requirementsList, setRequirementsList, newRequirement, setNewRequirement)}
                />
                <Button type="button" onClick={() => addItem(requirementsList, setRequirementsList, newRequirement, setNewRequirement)} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {requirementsList.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-card">
                    <span className="text-sm">{req}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(requirementsList, setRequirementsList, index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synchronization" className="space-y-4 mt-4">
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
                <Button type="button" onClick={() => addLinkedItem(selectedPhaseId, setSelectedPhaseId, linkedPhaseIds, setLinkedPhaseIds, 'phase')} size="sm">
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
                <Button type="button" onClick={() => addLinkedItem(selectedWBSNodeId, setSelectedWBSNodeId, linkedWBSNodeIds, setLinkedWBSNodeIds, 'wbs')} size="sm">
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
                <Button type="button" onClick={() => addLinkedItem(selectedTaskId, setSelectedTaskId, linkedTaskIds, setLinkedTaskIds, 'task')} size="sm">
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
                <Button type="button" onClick={() => addLinkedItem(selectedRiskId, setSelectedRiskId, linkedRiskIds, setLinkedRiskIds, 'risk')} size="sm">
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
                <Button type="button" onClick={() => addLinkedItem(selectedRequirementId, setSelectedRequirementId, linkedRequirementIds, setLinkedRequirementIds, 'requirement')} size="sm">
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
                <Label htmlFor="nextContactDate">Next Contact Date</Label>
                <Input
                  id="nextContactDate"
                  type="date"
                  value={nextContactDate}
                  onChange={(e) => setNextContactDate(e.target.value)}
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
            {mode === 'add' ? 'Add Stakeholder' : 'Update Stakeholder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

