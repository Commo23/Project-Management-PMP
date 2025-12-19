import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Users, Plus, Search, X, Mail, Phone, Briefcase, Calendar, 
  TrendingUp, Clock, Award, UserCheck, UserX, UserMinus
} from 'lucide-react';
import { TeamMember, TeamMemberRole, TeamMemberStatus } from '@/types/project';
import { TeamMemberDialog } from './TeamMemberDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

const statusColors = {
  active: 'bg-green-500/20 text-green-700 dark:text-green-400',
  'on-leave': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  offboarded: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  'part-time': 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
};

const statusLabels: Record<TeamMemberStatus, string> = {
  active: 'Active',
  'on-leave': 'On Leave',
  offboarded: 'Offboarded',
  'part-time': 'Part-Time',
};

export function TeamManagement() {
  const { 
    teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    phases,
    wbs,
    tasks,
    risks,
    requirements
  } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const handleAddMember = () => {
    setSelectedMember(null);
    setDialogMode('add');
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete.id);
      setMemberToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  // Filter and search team members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.organization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, filterRole, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = teamMembers.length;
    const active = teamMembers.filter(m => m.status === 'active').length;
    const onLeave = teamMembers.filter(m => m.status === 'on-leave').length;
    const partTime = teamMembers.filter(m => m.status === 'part-time').length;
    const totalAllocation = teamMembers.reduce((sum, m) => sum + (m.allocation || 0), 0);
    const avgWorkload = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.currentWorkload || 0), 0) / teamMembers.length)
      : 0;
    const highWorkload = teamMembers.filter(m => (m.currentWorkload || 0) >= 90).length;
    const totalCapacity = teamMembers.reduce((sum, m) => sum + (m.capacity || 0), 0);

    return {
      total,
      active,
      onLeave,
      partTime,
      totalAllocation,
      avgWorkload,
      highWorkload,
      totalCapacity,
    };
  }, [teamMembers]);

  const getLinkedEntityCount = (member: TeamMember): number => {
    let count = 0;
    if (member.linkedTaskIds) count += member.linkedTaskIds.length;
    if (member.linkedWBSNodeIds) count += member.linkedWBSNodeIds.length;
    if (member.linkedPhaseIds) count += member.linkedPhaseIds.length;
    if (member.linkedRiskIds) count += member.linkedRiskIds.length;
    if (member.linkedRequirementIds) count += member.linkedRequirementIds.length;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project team members, their skills, workload, and assignments
          </p>
        </div>
        <Button onClick={handleAddMember} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.onLeave} on leave
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAllocation.toFixed(1)} FTE</div>
            <p className="text-xs text-muted-foreground">
              {stats.partTime} part-time members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Workload</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWorkload}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.highWorkload} members at 90%+
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}h/week</div>
            <p className="text-xs text-muted-foreground">
              Combined weekly capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-3 w-3" />
                      {roleLabels[member.role]}{member.customRole && ` - ${member.customRole}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={cn(statusColors[member.status])}>
                  {statusLabels[member.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.organization && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{member.organization}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Availability</div>
                  <div className="text-sm font-medium">{member.availability || 100}%</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-xs text-muted-foreground">Workload</div>
                  <div className={cn(
                    "text-sm font-medium",
                    (member.currentWorkload || 0) >= 90 ? "text-red-600" :
                    (member.currentWorkload || 0) >= 75 ? "text-yellow-600" :
                    "text-green-600"
                  )}>
                    {member.currentWorkload || 0}%
                  </div>
                </div>
              </div>
              {member.skills && member.skills.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Top Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {getLinkedEntityCount(member)} linked items
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMember(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(member)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {teamMembers.length === 0
                ? "Get started by adding your first team member"
                : "Try adjusting your filters to see more results"}
            </p>
            {teamMembers.length === 0 && (
              <Button onClick={handleAddMember} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Team Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Member Dialog */}
      <TeamMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
        mode={dialogMode}
        onSave={(memberData) => {
          if (dialogMode === 'add') {
            addTeamMember(memberData);
          } else if (selectedMember) {
            updateTeamMember(selectedMember.id, memberData);
          }
          setIsDialogOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{memberToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

