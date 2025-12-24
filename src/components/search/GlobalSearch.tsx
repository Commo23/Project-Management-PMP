import { useState, useMemo, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Target,
  ListTodo,
  Calendar,
  GitBranch
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'task' | 'backlog' | 'risk' | 'stakeholder' | 'requirement' | 'wbs' | 'team' | 'phase';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  view: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GlobalSearchProps {
  onViewChange?: (view: string) => void;
}

export function GlobalSearch({ onViewChange }: GlobalSearchProps) {
  const { 
    tasks = [], 
    backlog = [], 
    risks = [], 
    stakeholders = [], 
    requirements = [], 
    wbs = [],
    teamMembers = [],
    phases = []
  } = useProject();
  const { language } = useI18n();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      // Close on Escape
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search tasks
    (tasks || []).forEach(task => {
      if (
        (task.title?.toLowerCase() || '').includes(query) ||
        (task.description?.toLowerCase() || '').includes(query) ||
        (task.assignee?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title || '',
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          view: 'kanban',
          icon: CheckCircle2,
        });
      }
    });

    // Search backlog items
    (backlog || []).forEach(item => {
      if (
        (item.title?.toLowerCase() || '').includes(query) ||
        (item.description?.toLowerCase() || '').includes(query) ||
        (item.userStory?.asA?.toLowerCase() || '').includes(query) ||
        (item.userStory?.iWant?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: item.id,
          type: 'backlog',
          title: item.title || '',
          description: item.description || '',
          status: item.status,
          priority: item.priority,
          view: 'backlog',
          icon: ListTodo,
        });
      }
    });

    // Search risks
    (risks || []).forEach(risk => {
      if (
        (risk.title?.toLowerCase() || '').includes(query) ||
        (risk.description?.toLowerCase() || '').includes(query) ||
        (risk.category?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: risk.id,
          type: 'risk',
          title: risk.title || '',
          description: risk.description || '',
          status: risk.status,
          view: 'risks',
          icon: AlertTriangle,
        });
      }
    });

    // Search stakeholders
    (stakeholders || []).forEach(stakeholder => {
      if (
        (stakeholder.name?.toLowerCase() || '').includes(query) ||
        (stakeholder.role?.toLowerCase() || '').includes(query) ||
        (stakeholder.organization?.toLowerCase() || '').includes(query) ||
        (stakeholder.email?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: stakeholder.id,
          type: 'stakeholder',
          title: stakeholder.name || '',
          description: stakeholder.role || '',
          view: 'stakeholders',
          icon: Users,
        });
      }
    });

    // Search requirements
    (requirements || []).forEach(req => {
      if (
        (req.title?.toLowerCase() || '').includes(query) ||
        (req.description?.toLowerCase() || '').includes(query) ||
        (req.code?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: req.id,
          type: 'requirement',
          title: req.title || '',
          description: req.description || '',
          status: req.status,
          view: 'requirements',
          icon: FileText,
        });
      }
    });

    // Search WBS nodes
    const searchWBS = (nodes: typeof wbs) => {
      if (!nodes || !Array.isArray(nodes)) return;
      nodes.forEach(node => {
        if (
          (node.name?.toLowerCase() || '').includes(query) ||
          (node.description?.toLowerCase() || '').includes(query)
        ) {
          searchResults.push({
            id: node.id,
            type: 'wbs',
            title: node.name || '',
            description: node.description || '',
            status: node.status,
            view: 'wbs',
            icon: Target,
          });
        }
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          searchWBS(node.children);
        }
      });
    };
    searchWBS(wbs || []);

    // Search team members
    (teamMembers || []).forEach(member => {
      if (
        (member.name?.toLowerCase() || '').includes(query) ||
        (member.role?.toLowerCase() || '').includes(query) ||
        (member.email?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: member.id,
          type: 'team',
          title: member.name || '',
          description: member.role || '',
          view: 'team',
          icon: Users,
        });
      }
    });

    // Search phases
    (phases || []).forEach(phase => {
      if (
        (phase.name?.toLowerCase() || '').includes(query) ||
        (phase.description?.toLowerCase() || '').includes(query)
      ) {
        searchResults.push({
          id: phase.id,
          type: 'phase',
          title: phase.name || '',
          description: phase.description || '',
          view: 'flow',
          icon: GitBranch,
        });
      }
    });

    return searchResults.slice(0, 20); // Limit to 20 results
  }, [searchQuery, tasks, backlog, risks, stakeholders, requirements, wbs, teamMembers, phases]);

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setSearchQuery('');
    // Change view if callback provided
    if (onViewChange) {
      onViewChange(result.view);
    } else {
      // Fallback: dispatch custom event
      const event = new CustomEvent('changeView', { detail: result.view });
      window.dispatchEvent(event);
    }
  };

  // Listen for custom changeView events (fallback)
  useEffect(() => {
    const handleChangeView = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && onViewChange) {
        onViewChange(customEvent.detail);
      }
    };

    window.addEventListener('changeView', handleChangeView);
    return () => window.removeEventListener('changeView', handleChangeView);
  }, [onViewChange]);

  const getTypeLabel = (type: SearchResult['type']) => {
    const labels: Record<SearchResult['type'], string> = {
      task: language === 'fr' ? 'Tâche' : 'Task',
      backlog: language === 'fr' ? 'Backlog' : 'Backlog',
      risk: language === 'fr' ? 'Risque' : 'Risk',
      stakeholder: language === 'fr' ? 'Partie Prenante' : 'Stakeholder',
      requirement: language === 'fr' ? 'Exigence' : 'Requirement',
      wbs: language === 'fr' ? 'WBS' : 'WBS',
      team: language === 'fr' ? 'Équipe' : 'Team',
      phase: language === 'fr' ? 'Phase' : 'Phase',
    };
    return labels[type];
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
        title={language === 'fr' ? 'Recherche globale (Ctrl+K)' : 'Global search (Ctrl+K)'}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{language === 'fr' ? 'Rechercher' : 'Search'}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Recherche Globale' : 'Global Search'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === 'fr' 
                  ? 'Rechercher dans les tâches, backlog, risques, parties prenantes...' 
                  : 'Search tasks, backlog, risks, stakeholders...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {searchQuery && (
              <div className="max-h-[400px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {language === 'fr' 
                      ? 'Aucun résultat trouvé'
                      : 'No results found'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {results.length} {language === 'fr' ? 'résultats' : 'results'}
                    </div>
                    {results.map((result) => {
                      const Icon = result.icon;
                      return (
                        <Button
                          key={`${result.type}-${result.id}`}
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 h-auto"
                          onClick={() => handleResultClick(result)}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{result.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {result.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {result.status && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.status}
                                </Badge>
                              )}
                              {result.priority && (
                                <Badge variant="outline" className="text-xs">
                                  {result.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {language === 'fr' 
                  ? 'Commencez à taper pour rechercher...'
                  : 'Start typing to search...'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

