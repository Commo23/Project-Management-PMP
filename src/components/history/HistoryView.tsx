import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileText,
  Target,
  ListTodo,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { TaskHistoryEntry } from '@/types/project';

export function HistoryView() {
  const { taskHistory, tasks, backlog, risks, stakeholders, requirements, wbs } = useProject();
  const { t, language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Combine all history entries
  const allHistory = useMemo(() => {
    const entries: Array<TaskHistoryEntry & { entityType: string; entityName: string }> = [];

    // Task history
    taskHistory.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      entries.push({
        ...entry,
        entityType: 'task',
        entityName: task?.title || entry.taskId,
      });
    });

    // In a real app, you would also track history for:
    // - Backlog items
    // - Risks
    // - Stakeholders
    // - Requirements
    // - WBS nodes
    // For now, we'll focus on task history

    return entries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [taskHistory, tasks]);

  const filteredHistory = useMemo(() => {
    return allHistory.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || entry.entityType === filterType;
      const matchesAction = filterAction === 'all' || entry.action === filterAction;

      return matchesSearch && matchesType && matchesAction;
    });
  }, [allHistory, searchTerm, filterType, filterAction]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'status_changed':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'assigned':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'priority_changed':
        return <Target className="h-4 w-4 text-orange-500" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: language === 'fr' ? 'Créé' : 'Created',
      updated: language === 'fr' ? 'Mis à jour' : 'Updated',
      status_changed: language === 'fr' ? 'Statut modifié' : 'Status Changed',
      assigned: language === 'fr' ? 'Assigné' : 'Assigned',
      tag_added: language === 'fr' ? 'Tag ajouté' : 'Tag Added',
      tag_removed: language === 'fr' ? 'Tag retiré' : 'Tag Removed',
      priority_changed: language === 'fr' ? 'Priorité modifiée' : 'Priority Changed',
    };
    return labels[action] || action;
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      task: language === 'fr' ? 'Tâche' : 'Task',
      backlog: language === 'fr' ? 'Backlog' : 'Backlog',
      risk: language === 'fr' ? 'Risque' : 'Risk',
      stakeholder: language === 'fr' ? 'Partie Prenante' : 'Stakeholder',
      requirement: language === 'fr' ? 'Exigence' : 'Requirement',
      wbs: language === 'fr' ? 'WBS' : 'WBS',
    };
    return labels[type] || type;
  };

  const stats = useMemo(() => {
    const byType = new Map<string, number>();
    const byAction = new Map<string, number>();
    const byUser = new Map<string, number>();

    allHistory.forEach(entry => {
      byType.set(entry.entityType, (byType.get(entry.entityType) || 0) + 1);
      byAction.set(entry.action, (byAction.get(entry.action) || 0) + 1);
      byUser.set(entry.userName, (byUser.get(entry.userName) || 0) + 1);
    });

    return { byType, byAction, byUser };
  }, [allHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {language === 'fr' ? 'Historique et Audit' : 'History & Audit Trail'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {language === 'fr' 
            ? 'Suivi complet de tous les changements dans le projet'
            : 'Complete tracking of all changes in the project'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Total des Entrées' : 'Total Entries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byUser.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Types d\'Entités' : 'Entity Types'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'fr' ? 'Types d\'Actions' : 'Action Types'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byAction.size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Filtres' : 'Filters'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Type d\'entité' : 'Entity Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'fr' ? 'Tous les types' : 'All Types'}</SelectItem>
                <SelectItem value="task">{language === 'fr' ? 'Tâche' : 'Task'}</SelectItem>
                <SelectItem value="backlog">{language === 'fr' ? 'Backlog' : 'Backlog'}</SelectItem>
                <SelectItem value="risk">{language === 'fr' ? 'Risque' : 'Risk'}</SelectItem>
                <SelectItem value="stakeholder">{language === 'fr' ? 'Partie Prenante' : 'Stakeholder'}</SelectItem>
                <SelectItem value="requirement">{language === 'fr' ? 'Exigence' : 'Requirement'}</SelectItem>
                <SelectItem value="wbs">{language === 'fr' ? 'WBS' : 'WBS'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Type d\'action' : 'Action Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'fr' ? 'Toutes les actions' : 'All Actions'}</SelectItem>
                <SelectItem value="created">{language === 'fr' ? 'Créé' : 'Created'}</SelectItem>
                <SelectItem value="updated">{language === 'fr' ? 'Mis à jour' : 'Updated'}</SelectItem>
                <SelectItem value="status_changed">{language === 'fr' ? 'Statut modifié' : 'Status Changed'}</SelectItem>
                <SelectItem value="assigned">{language === 'fr' ? 'Assigné' : 'Assigned'}</SelectItem>
                <SelectItem value="priority_changed">{language === 'fr' ? 'Priorité modifiée' : 'Priority Changed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Historique des Changements' : 'Change History'}
          </CardTitle>
          <CardDescription>
            {filteredHistory.length} {language === 'fr' ? 'entrées trouvées' : 'entries found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {language === 'fr' 
                ? 'Aucune entrée d\'historique trouvée'
                : 'No history entries found'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{entry.userName}</span>
                      <span className="text-muted-foreground">
                        {getActionLabel(entry.action)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getEntityTypeLabel(entry.entityType)}
                      </Badge>
                      <span className="font-medium truncate">{entry.entityName}</span>
                    </div>
                    {entry.field && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {entry.field}: {entry.oldValue} → {entry.newValue}
                      </div>
                    )}
                    {entry.comment && (
                      <div className="mt-1 text-sm text-muted-foreground italic">
                        "{entry.comment}"
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(entry.timestamp), 'PPpp')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

