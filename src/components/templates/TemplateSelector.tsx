import { useState } from 'react';
import { useProjectManager } from '@/contexts/ProjectManagerContext';
import { useI18n } from '@/contexts/I18nContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projectTemplates, ProjectTemplate } from '@/data/projectTemplates';
import { Search, Sparkles } from 'lucide-react';
import { QuestionnaireWizard, QuestionnaireAnswers } from './QuestionnaireWizard';
import { generateTemplateFromAnswers } from '@/utils/templateGenerator';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject?: (templateId?: string) => void;
  setNewProjectName?: (name: string) => void;
  setNewProjectDescription?: (desc: string) => void;
}

export function TemplateSelector({ open, onOpenChange, onCreateProject, setNewProjectName, setNewProjectDescription }: TemplateSelectorProps) {
  const { createProject, switchProject } = useProjectManager();
  const { t, language } = useI18n();
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'questionnaire'>('templates');
  const [generatedTemplate, setGeneratedTemplate] = useState<Partial<ProjectTemplate> | null>(null);

  const filteredTemplates = projectTemplates.filter(template => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  });

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    if (!projectName) {
      setProjectName(template.name);
    }
    if (!projectDescription) {
      setProjectDescription(template.description);
    }
  };

  const handleCreate = async (template?: ProjectTemplate | Partial<ProjectTemplate>) => {
    const templateToUse = template || selectedTemplate;
    if (!templateToUse || !projectName.trim()) return;

    setCreating(true);
    try {
      const mode = templateToUse.mode || 'waterfall';
      const data = templateToUse.data || {};

      const projectId = createProject(
        projectName.trim(),
        projectDescription.trim(),
        mode,
        data
      );

      if (onCreateProject) {
        onCreateProject(projectId);
      } else {
        switchProject(projectId);
        // Reload to load the new project
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating project from template:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    const generated = generateTemplateFromAnswers(answers);
    const template: Partial<ProjectTemplate> = {
      id: 'generated',
      name: language === 'fr' ? 'Modèle Personnalisé' : 'Custom Template',
      description: language === 'fr' 
        ? 'Modèle généré selon vos réponses au questionnaire'
        : 'Template generated based on your questionnaire answers',
      mode: generated.mode || 'hybrid',
      category: answers.projectType,
      icon: '✨',
      data: generated,
    };
    
    setGeneratedTemplate(template);
    setSelectedTemplate(template as ProjectTemplate);
    
    // Pre-fill project name if not set
    if (!projectName && setNewProjectName) {
      const name = answers.customDescription 
        ? answers.customDescription.substring(0, 50)
        : `${template.name} - ${new Date().toLocaleDateString()}`;
      setNewProjectName(name);
      setProjectName(name);
    }
    
    // Switch to templates tab to show the generated template
    setActiveTab('templates');
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setProjectName('');
    setProjectDescription('');
    setSearchQuery('');
    setActiveTab('templates');
    setGeneratedTemplate(null);
    onOpenChange(false);
  };

  const categories = Array.from(new Set(projectTemplates.map(t => t.category)));

  const allTemplates = generatedTemplate 
    ? [generatedTemplate as ProjectTemplate, ...projectTemplates]
    : projectTemplates;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'fr' ? 'Créer un Projet' : 'Create Project'}
          </DialogTitle>
          <DialogDescription>
            {language === 'fr' 
              ? 'Choisissez un modèle ou répondez au questionnaire pour générer un modèle personnalisé'
              : 'Choose a template or answer the questionnaire to generate a custom template'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">
              {language === 'fr' ? 'Modèles' : 'Templates'}
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {language === 'fr' ? 'Questionnaire' : 'Questionnaire'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={language === 'fr' ? 'Rechercher un modèle...' : 'Search templates...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Generated Template Banner */}
              {generatedTemplate && (
                <Card className="border-primary border-2 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {language === 'fr' ? 'Modèle Généré' : 'Generated Template'}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {language === 'fr' 
                        ? 'Ce modèle a été généré selon vos réponses au questionnaire'
                        : 'This template was generated based on your questionnaire answers'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Templates Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allTemplates.filter(template => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    template.name.toLowerCase().includes(query) ||
                    template.description.toLowerCase().includes(query) ||
                    template.category.toLowerCase().includes(query)
                  );
                }).map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedTemplate?.id === template.id ? 'border-primary border-2' : ''
                    } ${template.id === 'generated' ? 'border-primary/50 bg-primary/5' : ''}`}
                    onClick={() => handleTemplateSelect(template as ProjectTemplate)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.id === 'generated' && (
                          <Sparkles className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{template.category}</span>
                        <span>•</span>
                        <span className="capitalize">{template.mode}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Project Details Form */}
              {selectedTemplate && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold">
                    {language === 'fr' ? 'Détails du Projet' : 'Project Details'}
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">
                      {language === 'fr' ? 'Nom du Projet' : 'Project Name'} *
                    </Label>
                    <Input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        if (setNewProjectName) setNewProjectName(e.target.value);
                      }}
                      placeholder={selectedTemplate.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">
                      {language === 'fr' ? 'Description' : 'Description'}
                    </Label>
                    <Textarea
                      id="project-description"
                      value={projectDescription}
                      onChange={(e) => {
                        setProjectDescription(e.target.value);
                        if (setNewProjectDescription) setNewProjectDescription(e.target.value);
                      }}
                      placeholder={selectedTemplate.description}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questionnaire" className="mt-4">
            <QuestionnaireWizard
              onComplete={handleQuestionnaireComplete}
              onCancel={handleClose}
            />
          </TabsContent>
        </Tabs>

        {activeTab === 'templates' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t.common.cancel}
            </Button>
            <Button 
              onClick={() => handleCreate()} 
              disabled={!selectedTemplate || !projectName.trim() || creating}
            >
              {creating 
                ? (language === 'fr' ? 'Création...' : 'Creating...')
                : (language === 'fr' ? 'Créer le Projet' : 'Create Project')
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

