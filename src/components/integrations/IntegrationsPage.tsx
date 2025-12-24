import { useState } from 'react';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { useI18n } from '@/contexts/I18nContext';
import { Integration, IntegrationType } from '@/types/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Zap,
  MessageSquare,
  Github,
  Link2,
  Webhook,
  Code
} from 'lucide-react';
import { IntegrationDialog } from './IntegrationDialog';
import { IntegrationDetailDialog } from './IntegrationDetailDialog';
import { formatDistanceToNow } from 'date-fns';
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

const integrationIcons: Record<IntegrationType, React.ComponentType<{ className?: string }>> = {
  jira: Zap,
  slack: MessageSquare,
  github: Github,
  'microsoft-teams': MessageSquare,
  webhook: Webhook,
  api: Code,
};

const integrationColors: Record<IntegrationType, string> = {
  jira: 'bg-blue-500',
  slack: 'bg-purple-500',
  github: 'bg-gray-800',
  'microsoft-teams': 'bg-blue-600',
  webhook: 'bg-green-500',
  api: 'bg-orange-500',
};

export function IntegrationsPage() {
  const { integrations, deleteIntegration, syncIntegration } = useIntegrations();
  const { language } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(null);

  const handleAddIntegration = () => {
    setSelectedIntegration(null);
    setIsDialogOpen(true);
  };

  const handleViewDetails = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setIntegrationToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (integrationToDelete) {
      deleteIntegration(integrationToDelete);
      setIntegrationToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSync = async (id: string) => {
    await syncIntegration(id);
  };

  const getStatusBadge = (status: Integration['status']) => {
    const variants: Record<Integration['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ComponentType<{ className?: string }> }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      inactive: { variant: 'secondary', icon: Clock },
      error: { variant: 'destructive', icon: XCircle },
      pending: { variant: 'outline', icon: Clock },
    };

    const { variant, icon: Icon } = variants[status];
    const labels: Record<Integration['status'], string> = {
      active: language === 'fr' ? 'Actif' : 'Active',
      inactive: language === 'fr' ? 'Inactif' : 'Inactive',
      error: language === 'fr' ? 'Erreur' : 'Error',
      pending: language === 'fr' ? 'En attente' : 'Pending',
    };

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    );
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active');
  const inactiveIntegrations = integrations.filter(i => i.status !== 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'fr' ? 'Intégrations' : 'Integrations'} <span className="text-sm font-normal text-muted-foreground">(Beta)</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fr' 
              ? 'Connectez vos outils de gestion de projet préférés. Version Beta - certaines fonctionnalités sont en cours de développement.'
              : 'Connect your favorite project management tools. Beta version - some features are still in development.'}
          </p>
        </div>
        <Button onClick={handleAddIntegration} className="gap-2">
          <Plus className="h-4 w-4" />
          {language === 'fr' ? 'Nouvelle Intégration' : 'New Integration'}
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {language === 'fr' ? 'Toutes' : 'All'} ({integrations.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            {language === 'fr' ? 'Actives' : 'Active'} ({activeIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            {language === 'fr' ? 'Inactives' : 'Inactive'} ({inactiveIntegrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'fr' ? 'Aucune intégration' : 'No integrations'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'fr' 
                    ? 'Commencez par ajouter une intégration pour connecter vos outils'
                    : 'Get started by adding an integration to connect your tools'}
                </p>
                <Button onClick={handleAddIntegration} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {language === 'fr' ? 'Ajouter une Intégration' : 'Add Integration'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => {
                const Icon = integrationIcons[integration.type];
                return (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${integrationColors[integration.type]} p-2 rounded-lg text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {integration.type.toUpperCase()}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {integration.description && (
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      )}
                      
                      {integration.lastSyncAt && (
                        <div className="text-xs text-muted-foreground">
                          {language === 'fr' ? 'Dernière synchronisation' : 'Last synced'}:{' '}
                          {formatDistanceToNow(new Date(integration.lastSyncAt), { addSuffix: true })}
                        </div>
                      )}

                      {integration.errorMessage && (
                        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                          {integration.errorMessage}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(integration)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Détails' : 'Details'}
                        </Button>
                        {integration.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            title={language === 'fr' ? 'Synchroniser' : 'Sync'}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(integration.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeIntegrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {language === 'fr' 
                    ? 'Aucune intégration active'
                    : 'No active integrations'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeIntegrations.map((integration) => {
                const Icon = integrationIcons[integration.type];
                return (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${integrationColors[integration.type]} p-2 rounded-lg text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {integration.type.toUpperCase()}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {integration.description && (
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      )}
                      
                      {integration.lastSyncAt && (
                        <div className="text-xs text-muted-foreground">
                          {language === 'fr' ? 'Dernière synchronisation' : 'Last synced'}:{' '}
                          {formatDistanceToNow(new Date(integration.lastSyncAt), { addSuffix: true })}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Détails' : 'Details'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(integration.id)}
                          title={language === 'fr' ? 'Synchroniser' : 'Sync'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveIntegrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {language === 'fr' 
                    ? 'Aucune intégration inactive'
                    : 'No inactive integrations'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveIntegrations.map((integration) => {
                const Icon = integrationIcons[integration.type];
                return (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${integrationColors[integration.type]} p-2 rounded-lg text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {integration.type.toUpperCase()}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {integration.description && (
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      )}

                      {integration.errorMessage && (
                        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                          {integration.errorMessage}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Détails' : 'Details'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(integration.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Integration Dialog */}
      <IntegrationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        integration={selectedIntegration}
      />

      {/* Integration Detail Dialog */}
      <IntegrationDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        integration={selectedIntegration}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Supprimer l\'Intégration' : 'Delete Integration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir supprimer cette intégration ? Cette action est irréversible.'
                : 'Are you sure you want to delete this integration? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              {language === 'fr' ? 'Supprimer' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

