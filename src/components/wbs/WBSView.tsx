import { useState, useMemo, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import { WBSNode } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  File, 
  Plus, 
  Edit, 
  Trash2, 
  Link2,
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WBSNodeDialog } from './WBSNodeDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-primary/20 text-primary',
  'completed': 'bg-success text-success-foreground',
  'on-hold': 'bg-warning/20 text-warning',
  'cancelled': 'bg-destructive/20 text-destructive',
};

export function WBSView() {
  const { 
    wbs = [], 
    setWbs, 
    addWBSNode, 
    updateWBSNode, 
    deleteWBSNode,
    phases: allPhases = [],
    tasks = [],
    backlog = [],
    requirements = [],
    risks = []
  } = useProject();
  const { settings } = useSettings();

  const phases = allPhases || [];

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Auto-expand all nodes if setting is enabled
  useEffect(() => {
    if (settings.wbsExpandAll) {
      const allNodeIds = new Set(wbs.map(node => node.id));
      setExpandedNodes(allNodeIds);
    } else {
      setExpandedNodes(new Set());
    }
  }, [settings.wbsExpandAll, wbs]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingNode, setEditingNode] = useState<WBSNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<WBSNode | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [addingToParentId, setAddingToParentId] = useState<string | undefined>(undefined);

  const rootNodes = useMemo(() => wbs.filter(node => !node.parentId), [wbs]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleAddNode = (parentId?: string) => {
    try {
      setEditingNode(null);
      setAddingToParentId(parentId);
      setDialogMode('add');
      setDialogOpen(true);
    } catch (error) {
      console.error('Error opening add dialog:', error);
    }
  };

  const handleEditNode = (node: WBSNode) => {
    try {
      if (!node) return;
      setEditingNode(node);
      setAddingToParentId(undefined);
      setDialogMode('edit');
      setDialogOpen(true);
    } catch (error) {
      console.error('Error opening edit dialog:', error);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    try {
      if (!nodeId) return;
      setNodeToDelete(nodeId);
      setDeleteConfirmOpen(true);
    } catch (error) {
      console.error('Error opening delete dialog:', error);
    }
  };

  const confirmDelete = () => {
    try {
      if (nodeToDelete) {
        deleteWBSNode(nodeToDelete);
        setNodeToDelete(null);
      }
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting node:', error);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSaveNode = (nodeData: Omit<WBSNode, 'id' | 'code' | 'level' | 'children'>, parentId?: string) => {
    try {
      if (dialogMode === 'add') {
        if (addWBSNode) {
          addWBSNode(nodeData, parentId);
        }
      } else if (editingNode && updateWBSNode) {
        updateWBSNode(editingNode.id, nodeData);
      }
      setDialogOpen(false);
      setEditingNode(null);
      setAddingToParentId(undefined);
    } catch (error) {
      console.error('Error saving WBS node:', error);
    }
  };

  const getLinkedTasks = (node: WBSNode) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(t => node.linkedTasks?.includes(t.id));
  };

  const getLinkedBacklogItems = (node: WBSNode) => {
    if (!backlog || !Array.isArray(backlog)) return [];
    return backlog.filter(b => node.linkedBacklogItems?.includes(b.id));
  };

  const getLinkedRequirements = (node: WBSNode) => {
    if (!requirements || !Array.isArray(requirements)) return [];
    return requirements.filter(r => node.linkedRequirements?.includes(r.id));
  };

  const getLinkedRisks = (node: WBSNode) => {
    if (!risks || !Array.isArray(risks)) return [];
    return risks.filter(r => node.linkedRisks?.includes(r.id));
  };

  const getPhaseName = (phaseId?: string) => {
    if (!phaseId || !phases || phases.length === 0) return null;
    const phase = phases.find(p => p.id === phaseId);
    return phase?.name || null;
  };

  const totalBudget = useMemo(() => {
    if (!settings.wbsShowBudget) return 0;
    return wbs.reduce((sum, node) => sum + (node.budget || 0), 0);
  }, [wbs, settings.wbsShowBudget]);
  const totalEstimatedHours = useMemo(() => wbs.reduce((sum, node) => sum + (node.estimatedHours || 0), 0), [wbs]);
  const averageProgress = useMemo(() => {
    if (!settings.wbsShowProgress) return 0;
    const total = wbs.reduce((sum, node) => sum + (node.progress || 0), 0);
    return wbs.length > 0 ? total / wbs.length : 0;
  }, [wbs, settings.wbsShowProgress]);

  const renderNode = (node: WBSNode, depth: number = 0) => {
    if (!node || !node.id) return null;
    
    try {
      const children = (wbs || []).filter(n => n && n.parentId === node.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const linkedTasks = getLinkedTasks(node);
      const linkedBacklogItems = getLinkedBacklogItems(node);
      const linkedRequirements = getLinkedRequirements(node);
      const linkedRisks = getLinkedRisks(node);
      const phaseName = getPhaseName(node.phaseId);

    return (
      <div key={node.id} className="animate-fade-in">
        <div
          className={cn(
            "group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm",
            node.milestones && "ring-2 ring-primary/50"
          )}
          style={{ marginLeft: depth * 24 }}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => hasChildren && toggleNode(node.id)}
            className={cn(!hasChildren && "invisible")}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {hasChildren ? (
            <FolderOpen className="h-5 w-5 text-warning flex-shrink-0" />
          ) : (
            <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs text-primary font-semibold">{node.code}</span>
              <span className="font-semibold text-foreground">{node.name}</span>
              {node.milestones && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                  Milestone
                </Badge>
              )}
              {node.status && (
                <Badge className={cn("text-xs", statusStyles[node.status] || statusStyles['not-started'])}>
                  {node.status.replace('-', ' ')}
                </Badge>
              )}
              {phaseName && (
                <Badge variant="outline" className="text-xs">
                  {phaseName}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{node.description}</p>
            
            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              {settings.wbsShowBudget && !settings.confidentialMode && node.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${node.budget.toLocaleString()}</span>
                </div>
              )}
              {node.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{node.estimatedHours}h</span>
                </div>
              )}
              {settings.wbsShowDates && node.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(node.startDate), 'MMM dd')} - {node.endDate ? format(new Date(node.endDate), 'MMM dd') : 'TBD'}</span>
                </div>
              )}
              {settings.wbsShowResponsible && node.responsible && (
                <div className="flex items-center gap-1">
                  <span>Responsible: {node.responsible}</span>
                </div>
              )}
              {settings.wbsShowLinkedItems && (linkedTasks.length > 0 || linkedBacklogItems.length > 0 || linkedRequirements.length > 0 || linkedRisks.length > 0) && (
                <div className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  <span>
                    {linkedTasks.length} tasks, {linkedBacklogItems.length} backlog, {linkedRequirements.length} reqs, {linkedRisks.length} risks
                  </span>
                </div>
              )}
            </div>

            {settings.wbsShowProgress && node.progress !== undefined && node.progress > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium">{node.progress}%</span>
                </div>
                <Progress value={node.progress} className="h-2" />
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                try {
                  setSelectedNode(node);
                } catch (error) {
                  console.error('Error viewing node:', error);
                }
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleEditNode(node);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleAddNode(node.id);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-border ml-6 mt-2">
            {children.map(child => child ? renderNode(child, depth + 1) : null)}
          </div>
        )}
      </div>
    );
    } catch (error) {
      console.error('Error rendering node:', error, node);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Work Breakdown Structure</h1>
        <p className="mt-2 text-muted-foreground">
            Hierarchical decomposition of project deliverables (PMBOK aligned)
          </p>
        </div>
        <Button onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddNode();
        }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add WBS Node
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <File className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Nodes</span>
          </div>
          <p className="text-2xl font-bold">{wbs.length}</p>
        </div>
        {settings.wbsShowBudget && !settings.confidentialMode && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Budget</span>
            </div>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </div>
        )}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Estimated Hours</span>
          </div>
          <p className="text-2xl font-bold">{totalEstimatedHours.toLocaleString()}</p>
        </div>
        {settings.wbsShowProgress && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
          </div>
        )}
      </div>

      {/* WBS Tree */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-2">
          {rootNodes && rootNodes.length > 0 ? (
            rootNodes.map(node => node ? renderNode(node) : null)
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No WBS nodes yet. Add your first node to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* WBS Dictionary */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h2 className="font-semibold text-foreground">WBS Dictionary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                {settings.wbsShowProgress && (
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
                )}
                {settings.wbsShowBudget && !settings.confidentialMode && (
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Budget</th>
                )}
                {settings.wbsShowResponsible && (
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Responsible</th>
                )}
              </tr>
            </thead>
            <tbody>
              {wbs && wbs.map((node, index) => {
                if (!node || !node.id) return null;
                return (
                <tr 
                  key={node.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30 cursor-pointer",
                    index % 2 === 0 && "bg-muted/10"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      setSelectedNode(node);
                    } catch (error) {
                      console.error('Error selecting node:', error);
                    }
                  }}
                >
                  <td className="p-3 font-mono text-sm text-primary font-semibold">{node.code}</td>
                  <td className="p-3 font-medium text-foreground">{node.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{node.description}</td>
                  <td className="p-3">
                    {node.status && (
                      <Badge className={cn("text-xs", statusStyles[node.status] || statusStyles['not-started'])}>
                        {node.status.replace('-', ' ')}
                      </Badge>
                    )}
                  </td>
                  {settings.wbsShowProgress && (
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={node.progress || 0} className="h-2 w-20" />
                        <span className="text-sm text-muted-foreground">{node.progress || 0}%</span>
                      </div>
                    </td>
                  )}
                  {settings.wbsShowBudget && !settings.confidentialMode && (
                    <td className="p-3 text-sm text-muted-foreground">
                      {node.budget ? `$${node.budget.toLocaleString()}` : '-'}
                    </td>
                  )}
                  {settings.wbsShowResponsible && (
                    <td className="p-3 text-sm text-muted-foreground">{node.responsible || '-'}</td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Detail Dialog */}
      {selectedNode && (
        <Dialog open={!!selectedNode} onOpenChange={(open) => {
          if (!open) {
            setSelectedNode(null);
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono text-primary">{selectedNode.code}</span>
                {selectedNode.name}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="synchronization">Synchronization</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Status</Label>
                    {selectedNode.status && (
                      <Badge className={cn(statusStyles[selectedNode.status] || statusStyles['not-started'])}>
                        {selectedNode.status.replace('-', ' ')}
                      </Badge>
                    )}
                  </div>
                  {selectedNode.phaseId && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Phase</Label>
                      <p className="text-sm text-muted-foreground">{getPhaseName(selectedNode.phaseId)}</p>
                    </div>
                  )}
                  {selectedNode.responsible && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Responsible</Label>
                      <p className="text-sm text-muted-foreground">{selectedNode.responsible}</p>
                    </div>
                  )}
                  {selectedNode.budget && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Budget</Label>
                      <p className="text-sm text-muted-foreground">${selectedNode.budget.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedNode.estimatedHours && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Estimated Hours</Label>
                      <p className="text-sm text-muted-foreground">{selectedNode.estimatedHours}h</p>
                    </div>
                  )}
                  {selectedNode.startDate && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Start Date</Label>
                      <p className="text-sm text-muted-foreground">{format(new Date(selectedNode.startDate), 'PPP')}</p>
                    </div>
                  )}
                  {selectedNode.endDate && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">End Date</Label>
                      <p className="text-sm text-muted-foreground">{format(new Date(selectedNode.endDate), 'PPP')}</p>
                    </div>
                  )}
                </div>
                {selectedNode.progress !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Progress</Label>
                    <Progress value={selectedNode.progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">{selectedNode.progress}%</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="synchronization" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {getLinkedTasks(selectedNode).length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Linked Tasks ({getLinkedTasks(selectedNode).length})</Label>
                      <div className="space-y-2">
                        {getLinkedTasks(selectedNode).map(task => (
                          <div key={task.id} className="p-2 rounded border border-border bg-card">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.status}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {getLinkedBacklogItems(selectedNode).length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Linked Backlog Items ({getLinkedBacklogItems(selectedNode).length})</Label>
                      <div className="space-y-2">
                        {getLinkedBacklogItems(selectedNode).map(item => (
                          <div key={item.id} className="p-2 rounded border border-border bg-card">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type} • {item.priority}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {getLinkedRequirements(selectedNode).length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Linked Requirements ({getLinkedRequirements(selectedNode).length})</Label>
                      <div className="space-y-2">
                        {getLinkedRequirements(selectedNode).map(req => (
                          <div key={req.id} className="p-2 rounded border border-border bg-card">
                            <p className="text-sm font-medium">{req.title}</p>
                            <p className="text-xs text-muted-foreground">{req.priority}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {getLinkedRisks(selectedNode).length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Linked Risks ({getLinkedRisks(selectedNode).length})</Label>
                      <div className="space-y-2">
                        {getLinkedRisks(selectedNode).map(risk => (
                          <div key={risk.id} className="p-2 rounded border border-border bg-card">
                            <p className="text-sm font-medium">{risk.title}</p>
                            <p className="text-xs text-muted-foreground">{risk.probability} • {risk.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {getLinkedTasks(selectedNode).length === 0 && getLinkedBacklogItems(selectedNode).length === 0 && getLinkedRequirements(selectedNode).length === 0 && getLinkedRisks(selectedNode).length === 0 && (
                    <p className="text-sm text-muted-foreground">No linked items</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deliverables" className="space-y-4 mt-4">
                {selectedNode.deliverables && selectedNode.deliverables.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNode.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deliverables defined</p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogs */}
      <WBSNodeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingNode(null);
            setAddingToParentId(undefined);
          }
        }}
        node={editingNode}
        wbsNodes={wbs}
        phases={phases.map(p => ({ id: p.id, name: p.name }))}
        tasks={tasks.map(t => ({ id: t.id, title: t.title }))}
        backlogItems={backlog.map(b => ({ id: b.id, title: b.title }))}
        requirements={requirements.map(r => ({ id: r.id, title: r.title }))}
        risks={risks.map(r => ({ id: r.id, title: r.title }))}
        onSave={(nodeData, parentId) => {
          try {
            handleSaveNode(nodeData, parentId || addingToParentId);
          } catch (error) {
            console.error('Error in onSave callback:', error);
          }
        }}
        mode={dialogMode}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete WBS Node?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the node and all its children. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
