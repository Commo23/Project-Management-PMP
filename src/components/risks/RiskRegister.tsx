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
import { AlertTriangle, Shield, RefreshCw, Check, Plus, Search, Filter, X, Link2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Risk, RiskCategory, RiskStatus, RiskResponseStrategy } from '@/types/project';
import { RiskDialog } from './RiskDialog';

const probabilityColors = {
  low: 'bg-green-500/20 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

const impactColors = {
  low: 'bg-green-500/20 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-500/20 text-red-700 dark:text-red-400',
  critical: 'bg-red-600 text-white',
};

const responseIcons = {
  avoid: Shield,
  mitigate: RefreshCw,
  transfer: RefreshCw,
  accept: Check,
  exploit: TrendingUp,
  enhance: TrendingUp,
  share: TrendingUp,
};

const responseLabels: Record<RiskResponseStrategy, string> = {
  avoid: 'Avoid',
  mitigate: 'Mitigate',
  transfer: 'Transfer',
  accept: 'Accept',
  exploit: 'Exploit',
  enhance: 'Enhance',
  share: 'Share',
};

export function RiskRegister() {
  const { 
    risks, 
    addRisk, 
    updateRisk, 
    deleteRisk,
    phases,
    wbs,
    tasks
  } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResponse, setFilterResponse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRiskDetail, setSelectedRiskDetail] = useState<Risk | null>(null);

  const handleAddRisk = () => {
    setSelectedRisk(null);
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRisk(risk);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteRisk = (risk: Risk) => {
    if (confirm(`Are you sure you want to delete risk "${risk.title}"?`)) {
      deleteRisk(risk.id);
    }
  };

  // Filter and sort risks
  const filteredAndSortedRisks = useMemo(() => {
    let filtered = risks.filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          risk.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          risk.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || risk.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || risk.status === filterStatus;
      const matchesResponse = filterResponse === 'all' || risk.response === filterResponse;
      return matchesSearch && matchesCategory && matchesStatus && matchesResponse;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          const dateA = a.identifiedDate ? new Date(a.identifiedDate).getTime() : 0;
          const dateB = b.identifiedDate ? new Date(b.identifiedDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [risks, searchTerm, filterCategory, filterStatus, filterResponse, sortBy, sortOrder]);

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-red-600 text-white';
    if (score >= 6) return 'bg-yellow-500 text-white';
    if (score >= 3) return 'bg-blue-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  };

  // Statistics
  const stats = useMemo(() => {
    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => r.score >= 9).length;
    const highRisks = risks.filter(r => r.score >= 6 && r.score < 9).length;
    const mediumRisks = risks.filter(r => r.score >= 3 && r.score < 6).length;
    const lowRisks = risks.filter(r => r.score < 3).length;
    const totalEstimatedCost = risks.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const totalResponseCost = risks.reduce((sum, r) => sum + (r.responseCost || 0), 0);
    const openRisks = risks.filter(r => r.status !== 'closed' && r.status !== 'occurred').length;
    const closedRisks = risks.filter(r => r.status === 'closed').length;

    return {
      totalRisks,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      totalEstimatedCost,
      totalResponseCost,
      openRisks,
      closedRisks,
    };
  }, [risks]);

  const getLinkedEntityName = (risk: Risk): string[] => {
    const links: string[] = [];
    if (risk.linkedPhaseId) {
      const phase = phases.find(p => p.id === risk.linkedPhaseId);
      if (phase) links.push(`Phase: ${phase.name}`);
    }
    if (risk.linkedWBSNodeId) {
      const node = wbs.find(w => w.id === risk.linkedWBSNodeId);
      if (node) links.push(`WBS: ${node.code} - ${node.name}`);
    }
    if (risk.linkedTaskIds && risk.linkedTaskIds.length > 0) {
      const taskNames = risk.linkedTaskIds
        .map(id => tasks.find(t => t.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (taskNames) links.push(`Tasks: ${taskNames}`);
    }
    return links;
  };

  // Risk Matrix Data
  const matrixData = useMemo(() => {
    const matrix: Record<string, number> = {};
    risks.forEach(risk => {
      const key = `${risk.probability}-${risk.impact}`;
      matrix[key] = (matrix[key] || 0) + 1;
    });
    return matrix;
  }, [risks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Register</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage project risks according to PMBOK standards
          </p>
        </div>
        <Button onClick={handleAddRisk}>
          <Plus className="h-4 w-4 mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.totalRisks}</div>
        </div>
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
          <div className="text-sm text-muted-foreground">Critical</div>
          <div className="text-2xl font-bold text-red-600">{stats.criticalRisks}</div>
        </div>
        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">
          <div className="text-sm text-muted-foreground">High</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.highRisks}</div>
        </div>
        <div className="rounded-xl border border-blue-500 bg-blue-500/10 p-4">
          <div className="text-sm text-muted-foreground">Medium</div>
          <div className="text-2xl font-bold text-blue-600">{stats.mediumRisks}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Low</div>
          <div className="text-2xl font-bold text-green-600">{stats.lowRisks}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Open</div>
          <div className="text-2xl font-bold">{stats.openRisks}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Closed</div>
          <div className="text-2xl font-bold">{stats.closedRisks}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Est. Cost</span>
          </div>
          <div className="text-2xl font-bold">${stats.totalEstimatedCost.toLocaleString()}</div>
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
              placeholder="Search risks..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="category">Category</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
        <div className="min-w-[150px]">
          <Label htmlFor="status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="identified">Identified</SelectItem>
              <SelectItem value="analyzing">Analyzing</SelectItem>
              <SelectItem value="mitigating">Mitigating</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="occurred">Occurred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="response">Response</Label>
          <Select value={filterResponse} onValueChange={setFilterResponse}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responses</SelectItem>
              <SelectItem value="avoid">Avoid</SelectItem>
              <SelectItem value="mitigate">Mitigate</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="accept">Accept</SelectItem>
              <SelectItem value="exploit">Exploit</SelectItem>
              <SelectItem value="enhance">Enhance</SelectItem>
              <SelectItem value="share">Share</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="sort">Sort By</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'score' | 'title' | 'date')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Risk Score</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="date">Date</SelectItem>
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
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterResponse !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
              setFilterResponse('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Risk Probability/Impact Matrix */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Matrix</h3>
        <div className="grid grid-cols-4 gap-2">
          <div></div>
          <div className="text-center text-sm font-medium">Low</div>
          <div className="text-center text-sm font-medium">Medium</div>
          <div className="text-center text-sm font-medium">High</div>
          {(['high', 'medium', 'low'] as const).reverse().map((prob) => (
            <div key={prob} className="contents">
              <div className="text-sm font-medium capitalize flex items-center">{prob}</div>
              {(['low', 'medium', 'high', 'critical'] as const).map((imp) => {
                const key = `${prob}-${imp}`;
                const count = matrixData[key] || 0;
                const score = calculateScore(prob, imp);
                return (
                  <div
                    key={imp}
                    className={cn(
                      "p-4 rounded-lg text-center border-2",
                      getMatrixCellColor(score)
                    )}
                  >
                    <div className="text-xs font-medium mb-1">{score}</div>
                    <div className="text-lg font-bold">{count}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Risk List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Risk</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Probability</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Impact</th>
                <th className="p-4 text-center text-sm font-medium text-muted-foreground">Score</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Response</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Owner</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRisks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No risks found. {risks.length === 0 ? 'Add your first risk to get started.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedRisks.map((risk, index) => {
                  const ResponseIcon = responseIcons[risk.response] || Check;
                  const links = getLinkedEntityName(risk);
                  return (
                    <tr
                      key={risk.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30 cursor-pointer",
                        index % 2 === 0 && "bg-muted/10"
                      )}
                      onClick={() => setSelectedRiskDetail(risk)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{risk.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{risk.description}</p>
                          {links.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Link2 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{links.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {risk.category || 'other'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={cn("capitalize", probabilityColors[risk.probability])}>
                          {risk.probability}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={cn("capitalize", impactColors[risk.impact])}>
                          {risk.impact}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                            getScoreColor(risk.score)
                          )}>
                            {risk.score}
                          </span>
                          <span className="text-xs text-muted-foreground">{getScoreLabel(risk.score)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ResponseIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize text-sm text-foreground">{responseLabels[risk.response]}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{risk.owner}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {risk.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRisk(risk)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRisk(risk)}
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

      {/* Risk Detail Dialog */}
      <Dialog open={!!selectedRiskDetail} onOpenChange={(open) => !open && setSelectedRiskDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRiskDetail?.title}</DialogTitle>
            <DialogDescription>{selectedRiskDetail?.description}</DialogDescription>
          </DialogHeader>
          {selectedRiskDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{selectedRiskDetail.category || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <p className="text-sm">{selectedRiskDetail.owner}</p>
                  </div>
                  <div>
                    <Label>Probability</Label>
                    <Badge className={cn("capitalize", probabilityColors[selectedRiskDetail.probability])}>
                      {selectedRiskDetail.probability}
                    </Badge>
                  </div>
                  <div>
                    <Label>Impact</Label>
                    <Badge className={cn("capitalize", impactColors[selectedRiskDetail.impact])}>
                      {selectedRiskDetail.impact}
                    </Badge>
                  </div>
                  <div>
                    <Label>Risk Score</Label>
                    <Badge className={cn("text-lg px-4 py-2", getScoreColor(selectedRiskDetail.score))}>
                      {selectedRiskDetail.score} - {getScoreLabel(selectedRiskDetail.score)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline" className="capitalize">
                      {selectedRiskDetail.status}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="analysis" className="space-y-4">
                <div>
                  <Label>Root Causes</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedRiskDetail.rootCauses && selectedRiskDetail.rootCauses.length > 0 ? (
                      selectedRiskDetail.rootCauses.map((cause, idx) => (
                        <li key={idx} className="text-sm">{cause}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
                <div>
                  <Label>Effects/Consequences</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedRiskDetail.effects && selectedRiskDetail.effects.length > 0 ? (
                      selectedRiskDetail.effects.map((effect, idx) => (
                        <li key={idx} className="text-sm">{effect}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
                <div>
                  <Label>Triggers/Early Warning Indicators</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedRiskDetail.triggers && selectedRiskDetail.triggers.length > 0 ? (
                      selectedRiskDetail.triggers.map((trigger, idx) => (
                        <li key={idx} className="text-sm">{trigger}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="response" className="space-y-4">
                <div>
                  <Label>Response Strategy</Label>
                  <p className="text-sm capitalize">{responseLabels[selectedRiskDetail.response]}</p>
                </div>
                <div>
                  <Label>Response Plan</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedRiskDetail.responsePlan || 'N/A'}</p>
                </div>
                <div>
                  <Label>Response Actions</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRiskDetail.responseActions && selectedRiskDetail.responseActions.length > 0 ? (
                      selectedRiskDetail.responseActions.map((action) => (
                        <div key={action.id} className="p-3 rounded border border-border bg-card">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{action.description}</p>
                            <Badge variant="outline" className="capitalize">{action.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.owner} • {action.dueDate ? `Due: ${action.dueDate}` : 'No due date'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No actions defined</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Cost</Label>
                    <p className="text-sm">${selectedRiskDetail.estimatedCost?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Response Cost</Label>
                    <p className="text-sm">${selectedRiskDetail.responseCost?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
                {selectedRiskDetail.residualRisk && (
                  <div>
                    <Label>Residual Risk</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedRiskDetail.residualRisk}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="links" className="space-y-4">
                {getLinkedEntityName(selectedRiskDetail).length > 0 ? (
                  <ul className="space-y-2">
                    {getLinkedEntityName(selectedRiskDetail).map((link, idx) => (
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

      {/* Add/Edit Risk Dialog */}
      <RiskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        risk={selectedRisk}
        mode={dialogMode}
      />
    </div>
  );
}

// Helper functions
function calculateScore(probability: 'low' | 'medium' | 'high', impact: 'low' | 'medium' | 'high' | 'critical'): number {
  const probValues = { low: 1, medium: 2, high: 3 };
  const impactValues = { low: 1, medium: 2, high: 3, critical: 4 };
  return probValues[probability] * impactValues[impact];
}

function getMatrixCellColor(score: number): string {
  if (score >= 9) return 'bg-red-600 text-white border-red-700';
  if (score >= 6) return 'bg-yellow-500 text-white border-yellow-600';
  if (score >= 3) return 'bg-blue-500 text-white border-blue-600';
  return 'bg-green-500 text-white border-green-600';
}
