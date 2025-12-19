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
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Search, X, Link2, TrendingUp } from 'lucide-react';
import { Requirement } from '@/types/project';
import { RequirementDialog } from './RequirementDialog';

const typeColors = {
  functional: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  'non-functional': 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  business: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  technical: 'bg-green-500/20 text-green-700 dark:text-green-400',
  regulatory: 'bg-red-500/20 text-red-700 dark:text-red-400',
  quality: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
};

const statusIcons = {
  draft: Clock,
  approved: CheckCircle,
  implemented: CheckCircle,
  verified: CheckCircle,
  rejected: AlertCircle,
  deferred: Clock,
};

const statusColors = {
  draft: 'text-gray-500',
  approved: 'text-blue-500',
  implemented: 'text-yellow-500',
  verified: 'text-green-500',
  rejected: 'text-red-500',
  deferred: 'text-gray-400',
};

const priorityStyles = {
  low: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  medium: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  high: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  critical: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

export function RequirementsMatrix() {
  const { 
    requirements,
    deleteRequirement,
    tasks,
    backlog,
    wbs,
    phases,
    stakeholders,
    risks
  } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'code' | 'title' | 'priority' | 'status'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRequirementDetail, setSelectedRequirementDetail] = useState<Requirement | null>(null);

  const handleAddRequirement = () => {
    setSelectedRequirement(null);
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteRequirement = (requirement: Requirement) => {
    if (confirm(`Are you sure you want to delete requirement "${requirement.code} - ${requirement.title}"?`)) {
      deleteRequirement(requirement.id);
    }
  };

  // Filter and sort requirements
  const filteredAndSortedRequirements = useMemo(() => {
    let filtered = requirements.filter(req => {
      const matchesSearch = req.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.source?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || req.type === filterType;
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { verified: 6, implemented: 5, approved: 4, draft: 3, deferred: 2, rejected: 1 };
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requirements, searchTerm, filterType, filterStatus, filterPriority, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = requirements.length;
    const byStatus = {
      draft: requirements.filter(r => r.status === 'draft').length,
      approved: requirements.filter(r => r.status === 'approved').length,
      implemented: requirements.filter(r => r.status === 'implemented').length,
      verified: requirements.filter(r => r.status === 'verified').length,
      rejected: requirements.filter(r => r.status === 'rejected').length,
      deferred: requirements.filter(r => r.status === 'deferred').length,
    };
    const byType = {
      functional: requirements.filter(r => r.type === 'functional').length,
      'non-functional': requirements.filter(r => r.type === 'non-functional').length,
      business: requirements.filter(r => r.type === 'business').length,
      technical: requirements.filter(r => r.type === 'technical').length,
      regulatory: requirements.filter(r => r.type === 'regulatory').length,
      quality: requirements.filter(r => r.type === 'quality').length,
    };
    const byPriority = {
      critical: requirements.filter(r => r.priority === 'critical').length,
      high: requirements.filter(r => r.priority === 'high').length,
      medium: requirements.filter(r => r.priority === 'medium').length,
      low: requirements.filter(r => r.priority === 'low').length,
    };
    const validated = requirements.filter(r => r.validationStatus === 'passed').length;
    const pendingValidation = requirements.filter(r => 
      r.validationStatus === 'not-started' || r.validationStatus === 'in-progress'
    ).length;

    return {
      total,
      byStatus,
      byType,
      byPriority,
      validated,
      pendingValidation,
    };
  }, [requirements]);

  const getLinkedEntityNames = (requirement: Requirement): string[] => {
    const links: string[] = [];
    if (requirement.linkedTasks && requirement.linkedTasks.length > 0) {
      const taskNames = requirement.linkedTasks
        .map(id => tasks.find(t => t.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (taskNames) links.push(`Tasks: ${taskNames}`);
    }
    if (requirement.linkedBacklogItems && requirement.linkedBacklogItems.length > 0) {
      const backlogNames = requirement.linkedBacklogItems
        .map(id => backlog.find(b => b.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (backlogNames) links.push(`Backlog: ${backlogNames}`);
    }
    if (requirement.linkedWBSNodeIds && requirement.linkedWBSNodeIds.length > 0) {
      const wbsNames = requirement.linkedWBSNodeIds
        .map(id => {
          const node = wbs.find(w => w.id === id);
          return node ? `${node.code} - ${node.name}` : null;
        })
        .filter(Boolean)
        .join(', ');
      if (wbsNames) links.push(`WBS: ${wbsNames}`);
    }
    if (requirement.linkedPhaseIds && requirement.linkedPhaseIds.length > 0) {
      const phaseNames = requirement.linkedPhaseIds
        .map(id => phases.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      if (phaseNames) links.push(`Phases: ${phaseNames}`);
    }
    if (requirement.linkedStakeholderIds && requirement.linkedStakeholderIds.length > 0) {
      const stakeholderNames = requirement.linkedStakeholderIds
        .map(id => stakeholders.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      if (stakeholderNames) links.push(`Stakeholders: ${stakeholderNames}`);
    }
    if (requirement.linkedRiskIds && requirement.linkedRiskIds.length > 0) {
      const riskNames = requirement.linkedRiskIds
        .map(id => risks.find(r => r.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (riskNames) links.push(`Risks: ${riskNames}`);
    }
    return links;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-foreground">Requirements Traceability Matrix</h1>
        <p className="mt-2 text-muted-foreground">
            Track requirements from definition to verification according to PMBOK standards
        </p>
        </div>
        <Button onClick={handleAddRequirement}>
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-gray-500 bg-gray-500/10 p-4">
          <div className="text-sm text-muted-foreground">Draft</div>
          <div className="text-2xl font-bold text-gray-600">{stats.byStatus.draft}</div>
        </div>
        <div className="rounded-xl border border-blue-500 bg-blue-500/10 p-4">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold text-blue-600">{stats.byStatus.approved}</div>
        </div>
        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">
          <div className="text-sm text-muted-foreground">Implemented</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.implemented}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Verified</div>
          <div className="text-2xl font-bold text-green-600">{stats.byStatus.verified}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Validated</div>
          <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
        </div>
        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">
          <div className="text-sm text-muted-foreground">Pending Validation</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingValidation}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requirements..."
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
              <SelectItem value="functional">Functional</SelectItem>
              <SelectItem value="non-functional">Non-Functional</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="priority">Priority</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="sort">Sort By</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'code' | 'title' | 'priority' | 'status')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
              </div>
        <div className="min-w-[100px]">
          <Label htmlFor="order">Order</Label>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
            </div>
        {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterStatus('all');
              setFilterPriority('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Requirements Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Requirement</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Validation</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Links</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRequirements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No requirements found. {requirements.length === 0 ? 'Add your first requirement to get started.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedRequirements.map((req, index) => {
                const StatusIcon = statusIcons[req.status];
                  const links = getLinkedEntityNames(req);
                return (
                  <tr 
                    key={req.id}
                    className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30 cursor-pointer",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                      onClick={() => setSelectedRequirementDetail(req)}
                  >
                    <td className="p-4">
                        <span className="font-mono text-sm text-primary font-semibold">{req.code}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{req.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                          {req.source && (
                            <p className="text-xs text-muted-foreground mt-1">Source: {req.source}</p>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", typeColors[req.type])}>
                        {req.type.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("capitalize", priorityStyles[req.priority])}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4", statusColors[req.status])} />
                        <span className="text-sm capitalize text-foreground">{req.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                        {req.validationStatus ? (
                          <Badge variant="outline" className="capitalize">
                            {req.validationStatus}
                            </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        {links.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <Link2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{links.length} link(s)</span>
                        </div>
                      ) : (
                          <span className="text-xs text-muted-foreground">No links</span>
                      )}
                    </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRequirement(req)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRequirement(req)}
                          >
                            Delete
                          </Button>
                        </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requirement Detail Dialog */}
      <Dialog open={!!selectedRequirementDetail} onOpenChange={(open) => !open && setSelectedRequirementDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequirementDetail?.code} - {selectedRequirementDetail?.title}</DialogTitle>
            <DialogDescription>{selectedRequirementDetail?.description}</DialogDescription>
          </DialogHeader>
          {selectedRequirementDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Badge className={cn("capitalize mt-1", typeColors[selectedRequirementDetail.type])}>
                      {selectedRequirementDetail.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className={cn("capitalize mt-1", priorityStyles[selectedRequirementDetail.priority])}>
                      {selectedRequirementDetail.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const StatusIcon = statusIcons[selectedRequirementDetail.status];
                        return StatusIcon ? <StatusIcon className={cn("h-4 w-4", statusColors[selectedRequirementDetail.status])} /> : null;
                      })()}
                      <span className="text-sm capitalize">{selectedRequirementDetail.status}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <p className="text-sm mt-1">{selectedRequirementDetail.owner || 'N/A'}</p>
                  </div>
                </div>
                {selectedRequirementDetail.source && (
                  <div>
                    <Label>Source</Label>
                    <p className="text-sm mt-1">{selectedRequirementDetail.source}</p>
                  </div>
                )}
                {selectedRequirementDetail.rationale && (
                  <div>
                    <Label>Rationale</Label>
                    <p className="text-sm whitespace-pre-wrap mt-1">{selectedRequirementDetail.rationale}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label>Acceptance Criteria</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedRequirementDetail.acceptanceCriteria && selectedRequirementDetail.acceptanceCriteria.length > 0 ? (
                      selectedRequirementDetail.acceptanceCriteria.map((criterion, idx) => (
                        <li key={idx} className="text-sm">{criterion}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
                {selectedRequirementDetail.sourceDocument && (
                  <div>
                    <Label>Source Document</Label>
                    <p className="text-sm mt-1">{selectedRequirementDetail.sourceDocument}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="validation" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Validation Method</Label>
                    <p className="text-sm mt-1 capitalize">{selectedRequirementDetail.validationMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Validation Status</Label>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedRequirementDetail.validationStatus || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <Label>Validated By</Label>
                    <p className="text-sm mt-1">{selectedRequirementDetail.validatedBy || 'N/A'}</p>
                  </div>
                  {selectedRequirementDetail.verifiedDate && (
                    <div>
                      <Label>Verified Date</Label>
                      <p className="text-sm mt-1">{selectedRequirementDetail.verifiedDate}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="links" className="space-y-4">
                {getLinkedEntityNames(selectedRequirementDetail).length > 0 ? (
                  <ul className="space-y-2">
                    {getLinkedEntityNames(selectedRequirementDetail).map((link, idx) => (
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

      {/* Add/Edit Requirement Dialog */}
      <RequirementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        requirement={selectedRequirement}
        mode={dialogMode}
      />
    </div>
  );
}
