import { useState } from 'react';
import { useProjectManager } from '@/contexts/ProjectManagerContext';
import { Button } from '@/components/ui/button';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/contexts/I18nContext';
import { format } from 'date-fns';

export function ProjectSelector() {
  const { 
    projects, 
    currentProjectId, 
    createProject, 
    switchProject, 
    deleteProject, 
    duplicateProject 
  } = useProjectManager();
  const { t, language } = useI18n();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectMode, setNewProjectMode] = useState<'waterfall' | 'agile' | 'hybrid'>('waterfall');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const projectId = createProject(newProjectName.trim(), newProjectDescription.trim(), newProjectMode);
      switchProject(projectId);
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectMode('waterfall');
      // Reload to load new project
      window.location.reload();
    }
  };

  const handleSwitchProject = (projectId: string) => {
    switchProject(projectId);
    window.location.reload();
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      // Reload to switch to another project
      window.location.reload();
    }
  };

  const handleDuplicate = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newName = `${project.name} (${language === 'fr' ? 'Copie' : 'Copy'})`;
      const newId = duplicateProject(projectId, newName);
      if (newId) {
        switchProject(newId);
        window.location.reload();
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="max-w-[200px] truncate">
              {currentProject?.name || (language === 'fr' ? 'Nouveau Projet' : 'New Project')}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Nouveau Projet' : 'New Project'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsTemplateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Depuis un Modèle' : 'From Template'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {projects.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              {language === 'fr' ? 'Aucun projet' : 'No projects'}
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between group">
                <DropdownMenuItem
                  onClick={() => handleSwitchProject(project.id)}
                  className={currentProjectId === project.id ? 'bg-primary/10' : ''}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </DropdownMenuItem>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(project.id);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Nouveau Projet' : 'New Project'}</DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Créez un nouveau projet de gestion'
                : 'Create a new management project'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                {language === 'fr' ? 'Nom du Projet' : 'Project Name'} *
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={language === 'fr' ? 'Mon Projet' : 'My Project'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) {
                    handleCreateProject();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">
                {language === 'fr' ? 'Description' : 'Description'}
              </Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder={language === 'fr' ? 'Description du projet...' : 'Project description...'}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-mode">
                {language === 'fr' ? 'Mode' : 'Mode'}
              </Label>
              <Select value={newProjectMode} onValueChange={(v) => setNewProjectMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waterfall">{t.modes.waterfall}</SelectItem>
                  <SelectItem value="agile">{t.modes.agile}</SelectItem>
                  <SelectItem value="hybrid">{t.modes.hybrid}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              {language === 'fr' ? 'Créer' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Supprimer le Projet' : 'Delete Project'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.'
                : 'Are you sure you want to delete this project? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Selector */}
      <TemplateSelector 
        open={isTemplateDialogOpen} 
        onOpenChange={setIsTemplateDialogOpen} 
      />
    </>
  );
}

