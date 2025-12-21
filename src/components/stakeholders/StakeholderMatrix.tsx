import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { User, Building, Lock, Plus, Search, X, Mail, Phone, Link2, Calendar, MessageSquare } from 'lucide-react';
import { Stakeholder } from '@/types/project';
import { StakeholderDialog } from './StakeholderDialog';

const influenceColors = {
  low: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  medium: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  high: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

const engagementColors = {
  unaware: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  resistant: 'bg-red-500/20 text-red-700 dark:text-red-400',
  neutral: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  supportive: 'bg-green-500/20 text-green-700 dark:text-green-400',
  leading: 'bg-blue-600 text-white',
};

export function StakeholderMatrix() {
  const { 
    stakeholders,
    deleteStakeholder,
    phases,
    wbs,
    tasks,
    risks,
    requirements
  } = useProject();
  const { settings } = useSettings();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInfluence, setFilterInfluence] = useState<string>('all');
  const [filterInterest, setFilterInterest] = useState<string>('all');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [selectedStakeholderDetail, setSelectedStakeholderDetail] = useState<Stakeholder | null>(null);

  const handleAddStakeholder = () => {
    setSelectedStakeholder(null);
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteStakeholder = (stakeholder: Stakeholder) => {
    if (confirm(`Are you sure you want to delete stakeholder "${stakeholder.name}"?`)) {
      deleteStakeholder(stakeholder.id);
    }
  };

  // Grid positions for Power/Interest matrix
  const getGridPosition = (influence: string, interest: string) => {
    const x = interest === 'low' ? 0 : interest === 'medium' ? 1 : 2;
    const y = influence === 'low' ? 2 : influence === 'medium' ? 1 : 0;
    return { x, y };
  };

  const gridLabels = [
    ['Keep Satisfied', 'Manage Closely', 'Key Players'],
    ['Keep Informed', 'Keep Informed', 'Manage Closely'],
    ['Monitor', 'Keep Informed', 'Keep Satisfied'],
  ];

  // Filter and search stakeholders
  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(stakeholder => {
      const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stakeholder.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stakeholder.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInfluence = filterInfluence === 'all' || stakeholder.influence === filterInfluence;
      const matchesInterest = filterInterest === 'all' || stakeholder.interest === filterInterest;
      const matchesEngagement = filterEngagement === 'all' || stakeholder.engagementLevel === filterEngagement;
      return matchesSearch && matchesInfluence && matchesInterest && matchesEngagement;
    });
  }, [stakeholders, searchTerm, filterInfluence, filterInterest, filterEngagement]);

  // Statistics
  const stats = useMemo(() => {
    const total = stakeholders.length;
    const highInfluence = stakeholders.filter(s => s.influence === 'high').length;
    const highInterest = stakeholders.filter(s => s.interest === 'high').length;
    const leading = stakeholders.filter(s => s.engagementLevel === 'leading').length;
    const supportive = stakeholders.filter(s => s.engagementLevel === 'supportive').length;
    const resistant = stakeholders.filter(s => s.engagementLevel === 'resistant').length;
    const needsAttention = stakeholders.filter(s => 
      s.engagementLevel === 'resistant' || s.engagementLevel === 'unaware'
    ).length;

    return {
      total,
      highInfluence,
      highInterest,
      leading,
      supportive,
      resistant,
      needsAttention,
    };
  }, [stakeholders]);

  const getLinkedEntityNames = (stakeholder: Stakeholder): string[] => {
    const links: string[] = [];
    if (stakeholder.linkedPhaseIds && stakeholder.linkedPhaseIds.length > 0) {
      const phaseNames = stakeholder.linkedPhaseIds
        .map(id => phases.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      if (phaseNames) links.push(`Phases: ${phaseNames}`);
    }
    if (stakeholder.linkedWBSNodeIds && stakeholder.linkedWBSNodeIds.length > 0) {
      const wbsNames = stakeholder.linkedWBSNodeIds
        .map(id => {
          const node = wbs.find(w => w.id === id);
          return node ? `${node.code} - ${node.name}` : null;
        })
        .filter(Boolean)
        .join(', ');
      if (wbsNames) links.push(`WBS: ${wbsNames}`);
    }
    if (stakeholder.linkedTaskIds && stakeholder.linkedTaskIds.length > 0) {
      const taskNames = stakeholder.linkedTaskIds
        .map(id => tasks.find(t => t.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (taskNames) links.push(`Tasks: ${taskNames}`);
    }
    if (stakeholder.linkedRiskIds && stakeholder.linkedRiskIds.length > 0) {
      const riskNames = stakeholder.linkedRiskIds
        .map(id => risks.find(r => r.id === id)?.title)
        .filter(Boolean)
        .join(', ');
      if (riskNames) links.push(`Risks: ${riskNames}`);
    }
    if (stakeholder.linkedRequirementIds && stakeholder.linkedRequirementIds.length > 0) {
      const reqNames = stakeholder.linkedRequirementIds
        .map(id => {
          const req = requirements.find(r => r.id === id);
          return req ? `${req.code} - ${req.title}` : null;
        })
        .filter(Boolean)
        .join(', ');
      if (reqNames) links.push(`Requirements: ${reqNames}`);
    }
    return links;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stakeholder Engagement</h1>
          <p className="mt-2 text-muted-foreground">
            Power/Interest matrix and stakeholder management according to PMBOK standards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Lock className="h-3 w-3" />
            Confidential
          </Badge>
          <Button onClick={handleAddStakeholder}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-purple-500 bg-purple-500/10 p-4">
          <div className="text-sm text-muted-foreground">High Influence</div>
          <div className="text-2xl font-bold text-purple-600">{stats.highInfluence}</div>
        </div>
        <div className="rounded-xl border border-blue-500 bg-blue-500/10 p-4">
          <div className="text-sm text-muted-foreground">High Interest</div>
          <div className="text-2xl font-bold text-blue-600">{stats.highInterest}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Leading</div>
          <div className="text-2xl font-bold text-green-600">{stats.leading}</div>
        </div>
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <div className="text-sm text-muted-foreground">Supportive</div>
          <div className="text-2xl font-bold text-green-600">{stats.supportive}</div>
        </div>
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
          <div className="text-sm text-muted-foreground">Resistant</div>
          <div className="text-2xl font-bold text-red-600">{stats.resistant}</div>
        </div>
        <div className="rounded-xl border border-yellow-500 bg-yellow-500/10 p-4">
          <div className="text-sm text-muted-foreground">Needs Attention</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</div>
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
              placeholder="Search stakeholders..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="influence">Influence</Label>
          <Select value={filterInfluence} onValueChange={setFilterInfluence}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="interest">Interest</Label>
          <Select value={filterInterest} onValueChange={setFilterInterest}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
          <Label htmlFor="engagement">Engagement</Label>
          <Select value={filterEngagement} onValueChange={setFilterEngagement}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unaware">Unaware</SelectItem>
              <SelectItem value="resistant">Resistant</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="supportive">Supportive</SelectItem>
              <SelectItem value="leading">Leading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(searchTerm || filterInfluence !== 'all' || filterInterest !== 'all' || filterEngagement !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterInfluence('all');
              setFilterInterest('all');
              setFilterEngagement('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Power/Interest Matrix */}
      {!settings.confidentialMode && (
        <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">← Low Interest → High Interest</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(row => (
            [0, 1, 2].map(col => {
              const stakeholdersInCell = filteredStakeholders.filter(s => {
                const pos = getGridPosition(s.influence, s.interest);
                return pos.x === col && pos.y === row;
              });

              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    "rounded-lg border-2 border-border p-4 min-h-[150px] transition-all hover:shadow-md",
                    row === 0 && col >= 1 && "bg-primary/5 border-primary/20",
                    row <= 1 && col === 2 && "bg-primary/5 border-primary/20",
                  )}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    {gridLabels[row][col]}
                  </p>
                  <div className="space-y-2">
                    {stakeholdersInCell.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No stakeholders</p>
                    ) : (
                      stakeholdersInCell.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center gap-2 rounded bg-card p-2 text-xs shadow-sm border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedStakeholderDetail(s)}
                        >
                          <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">{s.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("ml-auto text-xs", engagementColors[s.engagementLevel])}
                          >
                            {s.engagementLevel}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <p className="text-sm font-medium text-muted-foreground">
            ↑ High Power | Low Power ↓
          </p>
        </div>
        </div>
      )}

      {/* Stakeholder List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <h2 className="font-semibold text-foreground">Stakeholder Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Organization</th>
                {!settings.confidentialMode && (
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                )}
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Influence</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Interest</th>
                {!settings.confidentialMode && (
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Engagement</th>
                )}
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStakeholders.length === 0 ? (
                <tr>
                  <td colSpan={settings.confidentialMode ? 7 : 8} className="p-8 text-center text-muted-foreground">
                    No stakeholders found. {stakeholders.length === 0 ? 'Add your first stakeholder to get started.' : 'Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                filteredStakeholders.map((stakeholder, index) => {
                  const links = getLinkedEntityNames(stakeholder);
                  return (
                    <tr
                      key={stakeholder.id}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/30 cursor-pointer",
                        index % 2 === 0 && "bg-muted/10"
                      )}
                      onClick={() => setSelectedStakeholderDetail(stakeholder)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{stakeholder.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{stakeholder.role}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {stakeholder.organization}
                        </div>
                      </td>
                      {!settings.confidentialMode && (
                        <td className="p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {stakeholder.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{stakeholder.email}</span>
                              </div>
                            )}
                            {stakeholder.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{stakeholder.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="p-3">
                        <Badge className={cn("capitalize", influenceColors[stakeholder.influence])}>
                          {stakeholder.influence}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={cn("capitalize", influenceColors[stakeholder.interest])}>
                          {stakeholder.interest}
                        </Badge>
                      </td>
                      {!settings.confidentialMode && (
                        <td className="p-3">
                          <Badge className={cn("capitalize", engagementColors[stakeholder.engagementLevel])}>
                            {stakeholder.engagementLevel}
                          </Badge>
                        </td>
                      )}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStakeholder(stakeholder)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStakeholder(stakeholder)}
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

      {/* Stakeholder Detail Dialog */}
      <Dialog open={!!selectedStakeholderDetail} onOpenChange={(open) => !open && setSelectedStakeholderDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStakeholderDetail?.name}</DialogTitle>
            <DialogDescription>
              {selectedStakeholderDetail?.role} • {selectedStakeholderDetail?.organization}
            </DialogDescription>
          </DialogHeader>
          {selectedStakeholderDetail && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="needs">Needs & Expectations</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Influence</Label>
                    <Badge className={cn("capitalize mt-1", influenceColors[selectedStakeholderDetail.influence])}>
                      {selectedStakeholderDetail.influence}
                    </Badge>
                  </div>
                  <div>
                    <Label>Interest</Label>
                    <Badge className={cn("capitalize mt-1", influenceColors[selectedStakeholderDetail.interest])}>
                      {selectedStakeholderDetail.interest}
                    </Badge>
                  </div>
                  <div>
                    <Label>Engagement Level</Label>
                    <Badge className={cn("capitalize mt-1", engagementColors[selectedStakeholderDetail.engagementLevel])}>
                      {selectedStakeholderDetail.engagementLevel}
                    </Badge>
                  </div>
                  <div>
                    <Label>Communication Frequency</Label>
                    <p className="text-sm mt-1">{selectedStakeholderDetail.communicationFrequency || 'N/A'}</p>
                  </div>
                </div>
                {!settings.confidentialMode && selectedStakeholderDetail.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedStakeholderDetail.email}
                    </p>
                  </div>
                )}
                {!settings.confidentialMode && selectedStakeholderDetail.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedStakeholderDetail.phone}
                    </p>
                  </div>
                )}
                {selectedStakeholderDetail.identifiedDate && (
                  <div>
                    <Label>Identified Date</Label>
                    <p className="text-sm mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedStakeholderDetail.identifiedDate}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="engagement" className="space-y-4">
                {!settings.confidentialMode ? (
                  <>
                    <div>
                      <Label>Engagement Strategy</Label>
                      <p className="text-sm whitespace-pre-wrap mt-1">{selectedStakeholderDetail.engagementStrategy || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Communication Preferences</Label>
                      <p className="text-sm mt-1">{selectedStakeholderDetail.communicationPreferences || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Information confidentielle masquée</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="needs" className="space-y-4">
                <div>
                  <Label>Needs</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedStakeholderDetail.needs && selectedStakeholderDetail.needs.length > 0 ? (
                      selectedStakeholderDetail.needs.map((need, idx) => (
                        <li key={idx} className="text-sm">{need}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
                <div>
                  <Label>Expectations</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedStakeholderDetail.expectations && selectedStakeholderDetail.expectations.length > 0 ? (
                      selectedStakeholderDetail.expectations.map((expectation, idx) => (
                        <li key={idx} className="text-sm">{expectation}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
                <div>
                  <Label>Concerns</Label>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedStakeholderDetail.concerns && selectedStakeholderDetail.concerns.length > 0 ? (
                      selectedStakeholderDetail.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm">{concern}</li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">None specified</li>
                    )}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="links" className="space-y-4">
                {getLinkedEntityNames(selectedStakeholderDetail).length > 0 ? (
                  <ul className="space-y-2">
                    {getLinkedEntityNames(selectedStakeholderDetail).map((link, idx) => (
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

      {/* Add/Edit Stakeholder Dialog */}
      <StakeholderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        stakeholder={selectedStakeholder}
        mode={dialogMode}
      />
    </div>
  );
}
