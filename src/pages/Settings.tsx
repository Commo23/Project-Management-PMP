import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useProject } from '@/contexts/ProjectContext';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Trash2,
  Bell,
  Eye,
  LayoutDashboard,
  Target,
  Users,
  AlertTriangle,
  FileText,
  Calendar,
  BarChart3,
  Download,
  Database
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { mode, setMode } = useProject();
  const { t, language } = useI18n();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Settings are auto-saved via useEffect in SettingsContext
    setHasChanges(false);
  };

  const handleReset = () => {
    resetSettings();
    setShowResetDialog(false);
    setHasChanges(false);
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            {language === 'fr' ? 'Paramètres' : 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fr' 
              ? 'Configurez les paramètres de votre projet et de l\'application'
              : 'Configure your project and application settings'}
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="outline" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {language === 'fr' ? 'Modifications non enregistrées' : 'Unsaved changes'}
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowResetDialog(true)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {language === 'fr' ? 'Réinitialiser' : 'Reset'}
          </Button>
          <Button onClick={handleSave} className="gap-2" disabled={!hasChanges}>
            <Save className="h-4 w-4" />
            {language === 'fr' ? 'Enregistrer' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t.settings.general}
          </TabsTrigger>
          <TabsTrigger value="project" className="gap-2">
            <FileText className="h-4 w-4" />
            {t.settings.project}
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-2">
            <Eye className="h-4 w-4" />
            {t.settings.display}
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {language === 'fr' ? 'Fonctionnalités' : 'Features'}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                {language === 'fr' ? 'Paramètres Généraux' : 'General Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Paramètres de base de l\'application'
                  : 'Basic application settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectMode">{t.modes.mode}</Label>
                <Select 
                  value={mode} 
                  onValueChange={(v) => {
                    setMode(v as 'waterfall' | 'agile' | 'hybrid');
                    handleChange('projectMode', v);
                  }}
                >
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

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">{t.settings.notifications}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' 
                      ? 'Activer les notifications pour les mises à jour du projet'
                      : 'Enable notifications for project updates'}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave">{t.settings.autoSave}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' 
                      ? 'Enregistrer automatiquement les modifications'
                      : 'Automatically save changes'}
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleChange('autoSave', checked)}
                />
              </div>

              {settings.autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveInterval">
                    {language === 'fr' ? 'Intervalle d\'enregistrement automatique (secondes)' : 'Auto-save interval (seconds)'}
                  </Label>
                  <Input
                    id="autoSaveInterval"
                    type="number"
                    min="5"
                    max="300"
                    value={settings.autoSaveInterval}
                    onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) || 30)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Settings */}
        <TabsContent value="project" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'fr' ? 'Informations du Projet' : 'Project Information'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Détails et informations sur le projet'
                  : 'Project details and information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">{t.settings.projectName}</Label>
                <Input
                  id="projectName"
                  value={settings.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder={language === 'fr' ? 'Nom du projet' : 'Project name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">{t.settings.projectDescription}</Label>
                <Textarea
                  id="projectDescription"
                  value={settings.projectDescription}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  placeholder={language === 'fr' ? 'Description du projet' : 'Project description'}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectStartDate">
                    {language === 'fr' ? 'Date de Début' : 'Start Date'}
                  </Label>
                  <Input
                    id="projectStartDate"
                    type="date"
                    value={settings.projectStartDate || ''}
                    onChange={(e) => handleChange('projectStartDate', e.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectEndDate">
                    {language === 'fr' ? 'Date de Fin' : 'End Date'}
                  </Label>
                  <Input
                    id="projectEndDate"
                    type="date"
                    value={settings.projectEndDate || ''}
                    onChange={(e) => handleChange('projectEndDate', e.target.value || undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectManager">
                  {language === 'fr' ? 'Chef de Projet' : 'Project Manager'}
                </Label>
                <Input
                  id="projectManager"
                  value={settings.projectManager || ''}
                  onChange={(e) => handleChange('projectManager', e.target.value || undefined)}
                  placeholder={language === 'fr' ? 'Nom du chef de projet' : 'Project manager name'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {language === 'fr' ? 'Paramètres d\'Affichage' : 'Display Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Personnalisez l\'apparence de l\'application'
                  : 'Customize the application appearance'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">{t.settings.theme}</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(v) => handleChange('theme', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t.settings.light}</SelectItem>
                    <SelectItem value="dark">{t.settings.dark}</SelectItem>
                    <SelectItem value="system">{t.settings.system}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">{t.settings.dateFormat}</Label>
                <Select 
                  value={settings.dateFormat} 
                  onValueChange={(v) => handleChange('dateFormat', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">{t.settings.timeFormat}</Label>
                <Select 
                  value={settings.timeFormat} 
                  onValueChange={(v) => handleChange('timeFormat', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24-hour</SelectItem>
                    <SelectItem value="12h">12-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="density">
                  {language === 'fr' ? 'Densité d\'Affichage' : 'Display Density'}
                </Label>
                <Select 
                  value={settings.density} 
                  onValueChange={(v) => handleChange('density', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">{language === 'fr' ? 'Compact' : 'Compact'}</SelectItem>
                    <SelectItem value="comfortable">{language === 'fr' ? 'Confortable' : 'Comfortable'}</SelectItem>
                    <SelectItem value="spacious">{language === 'fr' ? 'Spacieux' : 'Spacious'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">
                  {language === 'fr' ? 'Taille de Police' : 'Font Size'}
                </Label>
                <Select 
                  value={settings.fontSize} 
                  onValueChange={(v) => handleChange('fontSize', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{language === 'fr' ? 'Petite' : 'Small'}</SelectItem>
                    <SelectItem value="medium">{language === 'fr' ? 'Moyenne' : 'Medium'}</SelectItem>
                    <SelectItem value="large">{language === 'fr' ? 'Grande' : 'Large'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="confidentialMode">
                    {language === 'fr' ? 'Mode Confidentiel' : 'Confidential Mode'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'fr' 
                      ? 'Masque les informations sensibles (matrices d\'engagement, contacts, budgets, etc.)'
                      : 'Hide sensitive information (engagement matrices, contacts, budgets, etc.)'}
                  </p>
                </div>
                <Switch
                  id="confidentialMode"
                  checked={settings.confidentialMode}
                  onCheckedChange={(checked) => handleChange('confidentialMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6 mt-6">
          {/* Kanban Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                {t.nav.kanbanBoard}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Points d\'Histoire' : 'Show Story Points'}</Label>
                <Switch checked={settings.kanbanShowStoryPoints} onCheckedChange={(c) => handleChange('kanbanShowStoryPoints', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Heures Estimées' : 'Show Estimated Hours'}</Label>
                <Switch checked={settings.kanbanShowEstimatedHours} onCheckedChange={(c) => handleChange('kanbanShowEstimatedHours', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Dates d\'Échéance' : 'Show Due Dates'}</Label>
                <Switch checked={settings.kanbanShowDueDates} onCheckedChange={(c) => handleChange('kanbanShowDueDates', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Étiquettes' : 'Show Tags'}</Label>
                <Switch checked={settings.kanbanShowTags} onCheckedChange={(c) => handleChange('kanbanShowTags', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Responsables' : 'Show Assignees'}</Label>
                <Switch checked={settings.kanbanShowAssignees} onCheckedChange={(c) => handleChange('kanbanShowAssignees', c)} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'fr' ? 'Taille des Cartes' : 'Card Size'}</Label>
                <Select value={settings.kanbanCardSize} onValueChange={(v) => handleChange('kanbanCardSize', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{language === 'fr' ? 'Petite' : 'Small'}</SelectItem>
                    <SelectItem value="medium">{language === 'fr' ? 'Moyenne' : 'Medium'}</SelectItem>
                    <SelectItem value="large">{language === 'fr' ? 'Grande' : 'Large'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* WBS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t.nav.wbs}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher le Budget' : 'Show Budget'}</Label>
                <Switch checked={settings.wbsShowBudget} onCheckedChange={(c) => handleChange('wbsShowBudget', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher la Progression' : 'Show Progress'}</Label>
                <Switch checked={settings.wbsShowProgress} onCheckedChange={(c) => handleChange('wbsShowProgress', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Dates' : 'Show Dates'}</Label>
                <Switch checked={settings.wbsShowDates} onCheckedChange={(c) => handleChange('wbsShowDates', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher le Responsable' : 'Show Responsible'}</Label>
                <Switch checked={settings.wbsShowResponsible} onCheckedChange={(c) => handleChange('wbsShowResponsible', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Développer Tout par Défaut' : 'Expand All by Default'}</Label>
                <Switch checked={settings.wbsExpandAll} onCheckedChange={(c) => handleChange('wbsExpandAll', c)} />
              </div>
            </CardContent>
          </Card>

          {/* RACI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t.nav.raciMatrix}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Phases' : 'Show Phases'}</Label>
                <Switch checked={settings.raciShowPhases} onCheckedChange={(c) => handleChange('raciShowPhases', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Nœuds SDP' : 'Show WBS Nodes'}</Label>
                <Switch checked={settings.raciShowWBS} onCheckedChange={(c) => handleChange('raciShowWBS', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Tâches' : 'Show Tasks'}</Label>
                <Switch checked={settings.raciShowTasks} onCheckedChange={(c) => handleChange('raciShowTasks', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Valider un Seul Responsable' : 'Validate Single Accountable'}</Label>
                <Switch checked={settings.raciValidateSingleAccountable} onCheckedChange={(c) => handleChange('raciValidateSingleAccountable', c)} />
              </div>
            </CardContent>
          </Card>

          {/* Risks Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t.nav.riskRegister}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher la Matrice' : 'Show Matrix'}</Label>
                <Switch checked={settings.risksShowMatrix} onCheckedChange={(c) => handleChange('risksShowMatrix', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Calculer Automatiquement le Score' : 'Auto-calculate Score'}</Label>
                <Switch checked={settings.risksAutoCalculateScore} onCheckedChange={(c) => handleChange('risksAutoCalculateScore', c)} />
              </div>
            </CardContent>
          </Card>

          {/* Timeline/Gantt Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t.nav.timeline}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher les Dépendances' : 'Show Dependencies'}</Label>
                <Switch checked={settings.ganttShowDependencies} onCheckedChange={(c) => handleChange('ganttShowDependencies', c)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{language === 'fr' ? 'Afficher la Progression' : 'Show Progress'}</Label>
                <Switch checked={settings.ganttShowProgress} onCheckedChange={(c) => handleChange('ganttShowProgress', c)} />
              </div>
              <div className="space-y-2">
                <Label>{language === 'fr' ? 'Niveau de Zoom' : 'Zoom Level'}</Label>
                <Select value={settings.ganttZoomLevel} onValueChange={(v) => handleChange('ganttZoomLevel', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{language === 'fr' ? 'Jour' : 'Day'}</SelectItem>
                    <SelectItem value="week">{language === 'fr' ? 'Semaine' : 'Week'}</SelectItem>
                    <SelectItem value="month">{language === 'fr' ? 'Mois' : 'Month'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Réinitialiser les Paramètres' : 'Reset Settings'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ? Cette action ne peut pas être annulée.'
                : 'Are you sure you want to reset all settings to default values? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {language === 'fr' ? 'Réinitialiser' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

