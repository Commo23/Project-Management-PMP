import { useIntegrations } from '@/contexts/IntegrationContext';
import { useI18n } from '@/contexts/I18nContext';
import { Integration } from '@/types/integrations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, RefreshCw, Play } from 'lucide-react';
import { SlackService } from '@/services/integrations/slackService';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface IntegrationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
}

export function IntegrationDetailDialog({ open, onOpenChange, integration }: IntegrationDetailDialogProps) {
  const { syncIntegration, syncs, webhookEvents } = useIntegrations();
  const { language } = useI18n();
  const [testingConnection, setTestingConnection] = useState(false);

  if (!integration) return null;

  const integrationSyncs = syncs.filter(s => s.integrationId === integration.id);
  const integrationWebhooks = webhookEvents.filter(w => w.integrationId === integration.id);

  const handleSync = async () => {
    await syncIntegration(integration.id);
  };

  const handleTestConnection = async () => {
    if (!integration || integration.type !== 'slack' || !integration.config.slackWebhookUrl) {
      return;
    }

    setTestingConnection(true);
    try {
      const slackService = new SlackService(integration.config);
      const success = await slackService.testConnection();
      
      if (success) {
        toast({
          title: language === 'fr' ? 'Test réussi' : 'Test successful',
          description: language === 'fr' 
            ? 'La connexion à Slack fonctionne correctement !'
            : 'Slack connection is working correctly!',
        });
      } else {
        toast({
          title: language === 'fr' ? 'Test échoué' : 'Test failed',
          description: language === 'fr' 
            ? 'Impossible de se connecter à Slack. Vérifiez votre URL webhook.'
            : 'Unable to connect to Slack. Please check your webhook URL.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error instanceof Error ? error.message : (language === 'fr' ? 'Erreur lors du test' : 'Test error'),
        variant: 'destructive',
      });
    } finally {
      setTestingConnection(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{integration.name}</DialogTitle>
            {getStatusBadge(integration.status)}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList>
            <TabsTrigger value="overview">
              {language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="syncs">
              {language === 'fr' ? 'Synchronisations' : 'Syncs'} ({integrationSyncs.length})
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              {language === 'fr' ? 'Webhooks' : 'Webhooks'} ({integrationWebhooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  {language === 'fr' ? 'Type' : 'Type'}
                </label>
                <p className="text-sm mt-1">{integration.type.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  {language === 'fr' ? 'Statut' : 'Status'}
                </label>
                <div className="mt-1">{getStatusBadge(integration.status)}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  {language === 'fr' ? 'Créé le' : 'Created'}
                </label>
                <p className="text-sm mt-1">
                  {format(new Date(integration.createdAt), 'PPP')}
                </p>
              </div>
              {integration.lastSyncAt && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    {language === 'fr' ? 'Dernière synchronisation' : 'Last Synced'}
                  </label>
                  <p className="text-sm mt-1">
                    {format(new Date(integration.lastSyncAt), 'PPP p')}
                  </p>
                </div>
              )}
            </div>

            {integration.description && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  {language === 'fr' ? 'Description' : 'Description'}
                </label>
                <p className="text-sm mt-1">{integration.description}</p>
              </div>
            )}

            {integration.errorMessage && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <label className="text-sm font-semibold text-destructive">
                  {language === 'fr' ? 'Erreur' : 'Error'}
                </label>
                <p className="text-sm mt-1 text-destructive">{integration.errorMessage}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-muted-foreground">
                {language === 'fr' ? 'Configuration' : 'Configuration'}
              </label>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(integration.config, null, 2)}
              </pre>
            </div>

            {integration.status === 'active' && (
              <div className="pt-4 border-t space-y-2">
                {integration.type === 'slack' && (
                  <Button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {testingConnection 
                      ? (language === 'fr' ? 'Test en cours...' : 'Testing...')
                      : (language === 'fr' ? 'Tester la connexion Slack' : 'Test Slack Connection')
                    }
                  </Button>
                )}
                <Button
                  onClick={handleSync}
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {language === 'fr' ? 'Synchroniser maintenant' : 'Sync Now'}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="syncs" className="mt-4">
            {integrationSyncs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {language === 'fr' ? 'Aucune synchronisation' : 'No syncs yet'}
              </p>
            ) : (
              <div className="space-y-2">
                {integrationSyncs.slice(0, 20).map((sync) => (
                  <div key={sync.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {sync.type} - {sync.entityType} ({sync.entityId})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sync.syncedAt), 'PPP p')}
                        </p>
                      </div>
                      <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                        {sync.status}
                      </Badge>
                    </div>
                    {sync.errorMessage && (
                      <p className="text-xs text-destructive mt-2">{sync.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            {integrationWebhooks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {language === 'fr' ? 'Aucun événement webhook' : 'No webhook events'}
              </p>
            ) : (
              <div className="space-y-2">
                {integrationWebhooks.slice(0, 20).map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.eventType}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.receivedAt), 'PPP p')}
                        </p>
                      </div>
                      <Badge variant={event.processed ? 'default' : 'secondary'}>
                        {event.processed ? (language === 'fr' ? 'Traité' : 'Processed') : (language === 'fr' ? 'En attente' : 'Pending')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

