import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { TeamMember, TeamMemberRole, TeamMemberStatus, SkillLevel, TeamMemberSkill } from '@/types/project';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
  mode: 'add' | 'edit';
  onSave: (member: Omit<TeamMember, 'id'>) => void;
}

const roleLabels: Record<TeamMemberRole, string> = {
  'project-manager': 'Project Manager',
  'product-owner': 'Product Owner',
  'scrum-master': 'Scrum Master',
  'developer': 'Developer',
  'designer': 'Designer',
  'qa-engineer': 'QA Engineer',
  'business-analyst': 'Business Analyst',
  'devops-engineer': 'DevOps Engineer',
  'architect': 'Architect',
  'technical-lead': 'Technical Lead',
  'ui-ux-designer': 'UI/UX Designer',
  'data-analyst': 'Data Analyst',
  'other': 'Other',
};

const skillLevelLabels: Record<SkillLevel, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'expert': 'Expert',
};

export function TeamMemberDialog({ open, onOpenChange, member, mode, onSave }: TeamMemberDialogProps) {
  const { 
    phases,
    wbs,
    tasks,
    risks,
    requirements
  } = useProject();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<TeamMemberRole>('developer');
  const [customRole, setCustomRole] = useState('');
  const [status, setStatus] = useState<TeamMemberStatus>('active');
  const [organization, setOrganization] = useState('');
  const [manager, setManager] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState<number>(100);
  const [allocation, setAllocation] = useState<number>(1.0);
  const [currentWorkload, setCurrentWorkload] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(40);
  const [skills, setSkills] = useState<TeamMemberSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate');
  const [newSkillYears, setNewSkillYears] = useState<number>(0);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState('');
  const [performanceRating, setPerformanceRating] = useState<number>(3);
  const [lastReviewDate, setLastReviewDate] = useState('');
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
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member && mode === 'edit') {
      setName(member.name);
      setEmail(member.email);
      setPhone(member.phone || '');
      setRole(member.role);
      setCustomRole(member.customRole || '');
      setStatus(member.status);
      setOrganization(member.organization || '');
      setManager(member.manager || '');
      setStartDate(member.startDate || '');
      setEndDate(member.endDate || '');
      setAvailability(member.availability ?? 100);
      setAllocation(member.allocation ?? 1.0);
      setCurrentWorkload(member.currentWorkload ?? 0);
      setCapacity(member.capacity ?? 40);
      setSkills(member.skills || []);
      setCertifications(member.certifications || []);
      setPerformanceRating(member.performanceRating ?? 3);
      setLastReviewDate(member.lastReviewDate || '');
      setLinkedPhaseIds(member.linkedPhaseIds || []);
      setLinkedWBSNodeIds(member.linkedWBSNodeIds || []);
      setLinkedTaskIds(member.linkedTaskIds || []);
      setLinkedRiskIds(member.linkedRiskIds || []);
      setLinkedRequirementIds(member.linkedRequirementIds || []);
      setNotes(member.notes || '');
    } else {
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setRole('developer');
      setCustomRole('');
      setStatus('active');
      setOrganization('');
      setManager('');
      setStartDate('');
      setEndDate('');
      setAvailability(100);
      setAllocation(1.0);
      setCurrentWorkload(0);
      setCapacity(40);
      setSkills([]);
      setCertifications([]);
      setPerformanceRating(3);
      setLastReviewDate('');
      setLinkedPhaseIds([]);
      setLinkedWBSNodeIds([]);
      setLinkedTaskIds([]);
      setLinkedRiskIds([]);
      setLinkedRequirementIds([]);
      setNotes('');
    }
  }, [member, mode, open]);

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      setSkills([...skills, {
        name: newSkillName.trim(),
        level: newSkillLevel,
        yearsOfExperience: newSkillYears > 0 ? newSkillYears : undefined,
      }]);
      setNewSkillName('');
      setNewSkillLevel('intermediate');
      setNewSkillYears(0);
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleAddPhase = () => {
    if (selectedPhaseId && selectedPhaseId !== '__none__' && !linkedPhaseIds.includes(selectedPhaseId)) {
      setLinkedPhaseIds([...linkedPhaseIds, selectedPhaseId]);
      setSelectedPhaseId('__none__');
    }
  };

  const handleRemovePhase = (phaseId: string) => {
    setLinkedPhaseIds(linkedPhaseIds.filter(id => id !== phaseId));
  };

  const handleAddWBSNode = () => {
    if (selectedWBSNodeId && selectedWBSNodeId !== '__none__' && !linkedWBSNodeIds.includes(selectedWBSNodeId)) {
      setLinkedWBSNodeIds([...linkedWBSNodeIds, selectedWBSNodeId]);
      setSelectedWBSNodeId('__none__');
    }
  };

  const handleRemoveWBSNode = (nodeId: string) => {
    setLinkedWBSNodeIds(linkedWBSNodeIds.filter(id => id !== nodeId));
  };

  const handleAddTask = () => {
    if (selectedTaskId && selectedTaskId !== '__none__' && !linkedTaskIds.includes(selectedTaskId)) {
      setLinkedTaskIds([...linkedTaskIds, selectedTaskId]);
      setSelectedTaskId('__none__');
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setLinkedTaskIds(linkedTaskIds.filter(id => id !== taskId));
  };

  const handleAddRisk = () => {
    if (selectedRiskId && selectedRiskId !== '__none__' && !linkedRiskIds.includes(selectedRiskId)) {
      setLinkedRiskIds([...linkedRiskIds, selectedRiskId]);
      setSelectedRiskId('__none__');
    }
  };

  const handleRemoveRisk = (riskId: string) => {
    setLinkedRiskIds(linkedRiskIds.filter(id => id !== riskId));
  };

  const handleAddRequirement = () => {
    if (selectedRequirementId && selectedRequirementId !== '__none__' && !linkedRequirementIds.includes(selectedRequirementId)) {
      setLinkedRequirementIds([...linkedRequirementIds, selectedRequirementId]);
      setSelectedRequirementId('__none__');
    }
  };

  const handleRemoveRequirement = (requirementId: string) => {
    setLinkedRequirementIds(linkedRequirementIds.filter(id => id !== requirementId));
  };

  const handleSave = () => {
    const memberData: Omit<TeamMember, 'id'> = {
      name,
      email,
      phone: phone || undefined,
      role,
      customRole: role === 'other' ? customRole : undefined,
      status,
      organization: organization || undefined,
      manager: manager || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      availability,
      allocation,
      currentWorkload: currentWorkload || undefined,
      capacity: capacity || undefined,
      skills: skills.length > 0 ? skills : undefined,
      certifications: certifications.length > 0 ? certifications : undefined,
      performanceRating: performanceRating || undefined,
      lastReviewDate: lastReviewDate || undefined,
      linkedPhaseIds: linkedPhaseIds.length > 0 ? linkedPhaseIds : undefined,
      linkedWBSNodeIds: linkedWBSNodeIds.length > 0 ? linkedWBSNodeIds : undefined,
      linkedTaskIds: linkedTaskIds.length > 0 ? linkedTaskIds : undefined,
      linkedRiskIds: linkedRiskIds.length > 0 ? linkedRiskIds : undefined,
      linkedRequirementIds: linkedRequirementIds.length > 0 ? linkedRequirementIds : undefined,
      notes: notes || undefined,
    };
    onSave(memberData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Team Member' : 'Edit Team Member'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Add a new team member to your project'
              : 'Update team member information'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={(value) => setRole(value as TeamMemberRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {role === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customRole">Custom Role</Label>
                <Input
                  id="customRole"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter custom role"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TeamMemberStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="offboarded">Offboarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Engineering"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Manager name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performanceRating">Performance Rating (1-5)</Label>
                <Select value={performanceRating.toString()} onValueChange={(value) => setPerformanceRating(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastReviewDate">Last Review Date</Label>
                <Input
                  id="lastReviewDate"
                  type="date"
                  value={lastReviewDate}
                  onChange={(e) => setLastReviewDate(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workload" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability (%)</Label>
                <Input
                  id="availability"
                  type="number"
                  min="0"
                  max="100"
                  value={availability}
                  onChange={(e) => setAvailability(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation">Allocation (FTE)</Label>
                <Input
                  id="allocation"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={allocation}
                  onChange={(e) => setAllocation(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentWorkload">Current Workload (%)</Label>
                <Input
                  id="currentWorkload"
                  type="number"
                  min="0"
                  max="100"
                  value={currentWorkload}
                  onChange={(e) => setCurrentWorkload(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Weekly Capacity (hours)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Skill name"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <Select value={newSkillLevel} onValueChange={(value) => setNewSkillLevel(value as SkillLevel)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(skillLevelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Years"
                  className="w-[100px]"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(parseInt(e.target.value) || 0)}
                />
                <Button type="button" onClick={handleAddSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    {skill.name} ({skillLevelLabels[skill.level]}{skill.yearsOfExperience ? `, ${skill.yearsOfExperience}y` : ''})
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Certification name"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                />
                <Button type="button" onClick={handleAddCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="gap-2">
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="space-y-2">
              <Label>Linked Phases</Label>
              <div className="flex gap-2">
                <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {phases.map(phase => (
                      <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddPhase} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedPhaseIds.map(phaseId => {
                  const phase = phases.find(p => p.id === phaseId);
                  return phase ? (
                    <Badge key={phaseId} variant="secondary" className="gap-2">
                      {phase.name}
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(phaseId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
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
                    {wbs.map(node => (
                      <SelectItem key={node.id} value={node.id}>{node.code} - {node.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddWBSNode} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedWBSNodeIds.map(nodeId => {
                  const node = wbs.find(w => w.id === nodeId);
                  return node ? (
                    <Badge key={nodeId} variant="secondary" className="gap-2">
                      {node.code} - {node.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveWBSNode(nodeId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
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
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddTask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedTaskIds.map(taskId => {
                  const task = tasks.find(t => t.id === taskId);
                  return task ? (
                    <Badge key={taskId} variant="secondary" className="gap-2">
                      {task.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(taskId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
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
                    {risks.map(risk => (
                      <SelectItem key={risk.id} value={risk.id}>{risk.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddRisk} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedRiskIds.map(riskId => {
                  const risk = risks.find(r => r.id === riskId);
                  return risk ? (
                    <Badge key={riskId} variant="secondary" className="gap-2">
                      {risk.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveRisk(riskId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
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
                    {requirements.map(req => (
                      <SelectItem key={req.id} value={req.id}>{req.code} - {req.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddRequirement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedRequirementIds.map(reqId => {
                  const req = requirements.find(r => r.id === reqId);
                  return req ? (
                    <Badge key={reqId} variant="secondary" className="gap-2">
                      {req.code} - {req.title}
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(reqId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this team member..."
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !email}>
            {mode === 'add' ? 'Add Member' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

