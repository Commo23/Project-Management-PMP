import { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { projectRoles, agileRoles } from '@/data/projectData';
import { RACIRole, RACIEntityType } from '@/types/project';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertTriangle, CheckCircle2, Link2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const raciColors: Record<RACIRole, string> = {
  'R': 'bg-blue-500 text-white',
  'A': 'bg-red-500 text-white',
  'C': 'bg-yellow-500 text-white',
  'I': 'bg-green-500 text-white',
  '': 'bg-muted text-muted-foreground',
};

const raciLabels: Record<RACIRole, string> = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '': '-',
};

export function RACIMatrix() {
  const { 
    phases, 
    raci, 
    setRaci, 
    addRACIEntry,
    updateRACIEntry,
    deleteRACIEntry,
    mode,
    tasks,
    wbs,
    customRoles,
    addCustomRole,
    deleteCustomRole
  } = useProject();
  
  const [activeTab, setActiveTab] = useState<RACIEntityType>('phase');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const baseRoles = mode === 'waterfall' ? projectRoles : agileRoles;
  const allRoles = [...baseRoles, ...customRoles];

  const getResponsibility = (entityType: RACIEntityType, entityId: string, role: string): RACIRole => {
    const entry = raci.find(r => r.entityType === entityType && r.entityId === entityId && r.role === role);
    return entry?.responsibility || '';
  };

  const validateRACI = (entityType: RACIEntityType, entityId: string, role: string, newResponsibility: RACIRole): { valid: boolean; message?: string } => {
    if (newResponsibility === 'A') {
      // Check if there's already an Accountable for this entity
      const existingAccountable = raci.find(
        r => r.entityType === entityType && 
        r.entityId === entityId && 
        r.responsibility === 'A' &&
        r.role !== role
      );
      if (existingAccountable) {
        return { 
          valid: false, 
          message: `There is already an Accountable (${existingAccountable.role}) for this item. Only one Accountable is allowed per item.` 
        };
      }
    }
    return { valid: true };
  };

  const cycleResponsibility = (entityType: RACIEntityType, entityId: string, role: string) => {
    const cycle: RACIRole[] = ['', 'R', 'A', 'C', 'I'];
    const current = getResponsibility(entityType, entityId, role);
    const currentIndex = cycle.indexOf(current);
    const next = cycle[(currentIndex + 1) % cycle.length];

    // Validate before updating
    const validation = validateRACI(entityType, entityId, role, next);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const existing = raci.find(r => r.entityType === entityType && r.entityId === entityId && r.role === role);
    if (existing) {
      updateRACIEntry(existing.id!, { responsibility: next });
    } else {
      addRACIEntry({
        entityType,
        entityId,
        role,
        responsibility: next,
      });
    }
  };

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      addCustomRole(newRoleName.trim());
      setNewRoleName('');
      setIsRoleDialogOpen(false);
    }
  };

  // Get entities based on active tab
  const entities = useMemo(() => {
    switch (activeTab) {
      case 'phase':
        return phases.map(p => ({ id: p.id, name: p.name, type: p.type }));
      case 'wbs':
        return wbs.map(w => ({ id: w.id, name: `${w.code} - ${w.name}`, type: 'wbs' }));
      case 'task':
        return tasks.map(t => ({ id: t.id, name: t.title, type: 'task' }));
      default:
        return [];
    }
  }, [activeTab, phases, wbs, tasks]);

  // Get validation issues
  const validationIssues = useMemo(() => {
    const issues: Array<{ entityType: RACIEntityType; entityId: string; message: string }> = [];
    const entityGroups = new Map<string, Array<{ role: string; entry: typeof raci[0] }>>();

    raci.forEach(entry => {
      const key = `${entry.entityType}-${entry.entityId}`;
      if (!entityGroups.has(key)) {
        entityGroups.set(key, []);
      }
      if (entry.responsibility === 'A') {
        entityGroups.get(key)!.push({ role: entry.role, entry });
      }
    });

    entityGroups.forEach((entries, key) => {
      if (entries.length > 1) {
        const [entityType, entityId] = key.split('-');
        issues.push({
          entityType: entityType as RACIEntityType,
          entityId,
          message: `Multiple Accountable roles found: ${entries.map(e => e.role).join(', ')}`,
        });
      }
    });

    return issues;
  }, [raci]);

  const getEntityName = (entityType: RACIEntityType, entityId: string): string => {
    switch (entityType) {
      case 'phase':
        return phases.find(p => p.id === entityId)?.name || entityId;
      case 'wbs':
        const wbsNode = wbs.find(w => w.id === entityId);
        return wbsNode ? `${wbsNode.code} - ${wbsNode.name}` : entityId;
      case 'task':
        return tasks.find(t => t.id === entityId)?.title || entityId;
      default:
        return entityId;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">RACI Matrix</h1>
          <p className="mt-2 text-muted-foreground">
            Define roles and responsibilities for project phases, WBS nodes, and tasks (PMBOK aligned)
          </p>
        </div>
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Role</DialogTitle>
              <DialogDescription>
                Add a new role to the RACI matrix. This role will be available across all entity types.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Business Analyst, QA Lead"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole}>
                Add Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Validation Alerts */}
      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">RACI Validation Issues Found:</p>
              {validationIssues.map((issue, idx) => (
                <p key={idx} className="text-sm">
                  • {getEntityName(issue.entityType, issue.entityId)}: {issue.message}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/30 p-4">
        {(['R', 'A', 'C', 'I'] as RACIRole[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
              raciColors[type]
            )}>
              {type}
            </span>
            <span className="text-sm text-muted-foreground">{raciLabels[type]}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span>Only one Accountable (A) per item</span>
        </div>
      </div>

      {/* Tabs for different entity types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RACIEntityType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase">Phases ({phases.length})</TabsTrigger>
          <TabsTrigger value="wbs">WBS Nodes ({wbs.length})</TabsTrigger>
          <TabsTrigger value="task">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="phase" className="mt-4">
          <RACITable
            entities={entities}
            roles={allRoles}
            entityType="phase"
            getResponsibility={getResponsibility}
            cycleResponsibility={cycleResponsibility}
            raciColors={raciColors}
            raciLabels={raciLabels}
            customRoles={customRoles}
            deleteCustomRole={deleteCustomRole}
          />
        </TabsContent>

        <TabsContent value="wbs" className="mt-4">
          <RACITable
            entities={entities}
            roles={allRoles}
            entityType="wbs"
            getResponsibility={getResponsibility}
            cycleResponsibility={cycleResponsibility}
            raciColors={raciColors}
            raciLabels={raciLabels}
            customRoles={customRoles}
            deleteCustomRole={deleteCustomRole}
          />
        </TabsContent>

        <TabsContent value="task" className="mt-4">
          <RACITable
            entities={entities}
            roles={allRoles}
            entityType="task"
            getResponsibility={getResponsibility}
            cycleResponsibility={cycleResponsibility}
            raciColors={raciColors}
            raciLabels={raciLabels}
            customRoles={customRoles}
            deleteCustomRole={deleteCustomRole}
          />
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total RACI Entries</div>
          <div className="text-2xl font-bold">{raci.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Roles</div>
          <div className="text-2xl font-bold">{allRoles.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Accountable Assignments</div>
          <div className="text-2xl font-bold">{raci.filter(r => r.responsibility === 'A').length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">Validation Issues</div>
          <div className="text-2xl font-bold text-destructive">{validationIssues.length}</div>
        </div>
      </div>
    </div>
  );
}

interface RACITableProps {
  entities: Array<{ id: string; name: string; type?: string }>;
  roles: string[];
  entityType: RACIEntityType;
  getResponsibility: (entityType: RACIEntityType, entityId: string, role: string) => RACIRole;
  cycleResponsibility: (entityType: RACIEntityType, entityId: string, role: string) => void;
  raciColors: Record<RACIRole, string>;
  raciLabels: Record<RACIRole, string>;
  customRoles: string[];
  deleteCustomRole: (role: string) => void;
}

function RACITable({
  entities,
  roles,
  entityType,
  getResponsibility,
  cycleResponsibility,
  raciColors,
  raciLabels,
  customRoles,
  deleteCustomRole,
}: RACITableProps) {
  const baseRoles = roles.filter(r => !customRoles.includes(r));

  return (
    <div className="space-y-4">
      {/* Base Roles Section */}
      {baseRoles.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left font-semibold text-foreground">Entity</th>
                {baseRoles.map((role) => (
                  <th key={role} className="p-4 text-center font-semibold text-foreground whitespace-nowrap">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entities.map((entity, index) => (
                <tr
                  key={entity.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    index % 2 === 0 && "bg-muted/10"
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{entity.name}</span>
                    </div>
                  </td>
                  {baseRoles.map((role) => {
                    const responsibility = getResponsibility(entityType, entity.id, role);
                    return (
                      <td key={role} className="p-4 text-center">
                        <button
                          onClick={() => cycleResponsibility(entityType, entity.id, role)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 mx-auto",
                            raciColors[responsibility],
                            "hover:scale-110 hover:shadow-md"
                          )}
                          title={`Click to change (${raciLabels[responsibility]})`}
                        >
                          {responsibility || '-'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Roles Section */}
      {customRoles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Custom Roles</h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-left font-semibold text-foreground">Entity</th>
                  {customRoles.map((role) => (
                    <th key={role} className="p-4 text-center font-semibold text-foreground whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <span>{role}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete role "${role}"? This will also remove all RACI entries for this role.`)) {
                              deleteCustomRole(role);
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, index) => (
                  <tr
                    key={entity.id}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-muted/30",
                      index % 2 === 0 && "bg-muted/10"
                    )}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{entity.name}</span>
                      </div>
                    </td>
                    {customRoles.map((role) => {
                      const responsibility = getResponsibility(entityType, entity.id, role);
                      return (
                        <td key={role} className="p-4 text-center">
                          <button
                            onClick={() => cycleResponsibility(entityType, entity.id, role)}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all duration-200 mx-auto",
                              raciColors[responsibility],
                              "hover:scale-110 hover:shadow-md"
                            )}
                            title={`Click to change (${raciLabels[responsibility]})`}
                          >
                            {responsibility || '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {entities.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No {entityType} entities found. Add some {entityType} items to create a RACI matrix.
        </div>
      )}
    </div>
  );
}
