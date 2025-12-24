import { useState, useEffect } from 'react';
import { useIntegrations } from '@/contexts/IntegrationContext';
import { useI18n } from '@/contexts/I18nContext';
import { Integration, IntegrationType, IntegrationConfig } from '@/types/integrations';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

interface IntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration?: Integration | null;
}

export function IntegrationDialog({ open, onOpenChange, integration }: IntegrationDialogProps) {
  const { addIntegration, updateIntegration } = useIntegrations();
  const { language } = useI18n();
  
  const [type, setType] = useState<IntegrationType>('jira');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<IntegrationConfig>({});

  useEffect(() => {
    if (integration) {
      setType(integration.type);
      setName(integration.name);
      setDescription(integration.description || '');
      setConfig(integration.config || {});
    } else {
      setType('jira');
      setName('');
      setDescription('');
      setConfig({});
    }
  }, [integration, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    if (integration) {
      updateIntegration(integration.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        config,
        type,
      });
    } else {
      addIntegration(type, name.trim(), config, description.trim() || undefined);
    }

    onOpenChange(false);
    // Reset form
    setName('');
    setDescription('');
    setConfig({});
  };

  const renderConfigFields = () => {
    switch (type) {
      case 'jira':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jira-url">
                {language === 'fr' ? 'URL Jira' : 'Jira URL'} *
              </Label>
              <Input
                id="jira-url"
                type="url"
                placeholder="https://your-domain.atlassian.net"
                value={config.jiraUrl || ''}
                onChange={(e) => setConfig({ ...config, jiraUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-email">
                {language === 'fr' ? 'Email' : 'Email'} *
              </Label>
              <Input
                id="jira-email"
                type="email"
                placeholder="your-email@example.com"
                value={config.jiraEmail || ''}
                onChange={(e) => setConfig({ ...config, jiraEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-token">
                {language === 'fr' ? 'Token API' : 'API Token'} *
              </Label>
              <Input
                id="jira-token"
                type="password"
                placeholder="••••••••"
                value={config.jiraApiToken || ''}
                onChange={(e) => setConfig({ ...config, jiraApiToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'fr' 
                  ? 'Créez un token API dans votre profil Jira'
                  : 'Create an API token in your Jira profile'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-project">
                {language === 'fr' ? 'Clé du Projet' : 'Project Key'} (optionnel)
              </Label>
              <Input
                id="jira-project"
                placeholder="PROJ"
                value={config.jiraProjectKey || ''}
                onChange={(e) => setConfig({ ...config, jiraProjectKey: e.target.value })}
              />
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <Tabs defaultValue="webhook" className="w-full">
              <TabsList>
                <TabsTrigger value="webhook">
                  {language === 'fr' ? 'Webhook' : 'Webhook'}
                </TabsTrigger>
                <TabsTrigger value="bot">
                  {language === 'fr' ? 'Bot Token' : 'Bot Token'}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="webhook" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">
                    {language === 'fr' ? 'URL Webhook' : 'Webhook URL'} *
                  </Label>
                  <Input
                    id="slack-webhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={config.slackWebhookUrl || ''}
                    onChange={(e) => setConfig({ ...config, slackWebhookUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-channel">
                    {language === 'fr' ? 'Canal' : 'Channel'} (optionnel)
                  </Label>
                  <Input
                    id="slack-channel"
                    placeholder="#project-updates"
                    value={config.slackChannel || ''}
                    onChange={(e) => setConfig({ ...config, slackChannel: e.target.value })}
                  />
                </div>
              </TabsContent>
              <TabsContent value="bot" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-bot-token">
                    {language === 'fr' ? 'Token Bot' : 'Bot Token'} *
                  </Label>
                  <Input
                    id="slack-bot-token"
                    type="password"
                    placeholder="xoxb-..."
                    value={config.slackBotToken || ''}
                    onChange={(e) => setConfig({ ...config, slackBotToken: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slack-channel-bot">
                    {language === 'fr' ? 'Canal' : 'Channel'} (optionnel)
                  </Label>
                  <Input
                    id="slack-channel-bot"
                    placeholder="#project-updates"
                    value={config.slackChannel || ''}
                    onChange={(e) => setConfig({ ...config, slackChannel: e.target.value })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'github':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token">
                {language === 'fr' ? 'Token GitHub' : 'GitHub Token'} *
              </Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_..."
                value={config.githubToken || ''}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-owner">
                {language === 'fr' ? 'Propriétaire' : 'Owner'} *
              </Label>
              <Input
                id="github-owner"
                placeholder="username"
                value={config.githubOwner || ''}
                onChange={(e) => setConfig({ ...config, githubOwner: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-repo">
                {language === 'fr' ? 'Dépôt' : 'Repository'} *
              </Label>
              <Input
                id="github-repo"
                placeholder="repository-name"
                value={config.githubRepo || ''}
                onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
              />
            </div>
          </div>
        );

      case 'microsoft-teams':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teams-webhook">
                {language === 'fr' ? 'URL Webhook' : 'Webhook URL'} *
              </Label>
              <Input
                id="teams-webhook"
                type="url"
                placeholder="https://outlook.office.com/webhook/..."
                value={config.teamsWebhookUrl || ''}
                onChange={(e) => setConfig({ ...config, teamsWebhookUrl: e.target.value })}
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">
                {language === 'fr' ? 'URL Webhook' : 'Webhook URL'} *
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-domain.com/webhook"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-secret">
                {language === 'fr' ? 'Secret' : 'Secret'} (optionnel)
              </Label>
              <Input
                id="webhook-secret"
                type="password"
                placeholder="••••••••"
                value={config.webhookSecret || ''}
                onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
              />
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">
                {language === 'fr' ? 'Endpoint API' : 'API Endpoint'} *
              </Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="https://api.example.com"
                value={config.apiEndpoint || ''}
                onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">
                {language === 'fr' ? 'Clé API' : 'API Key'} *
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="••••••••"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-secret">
                {language === 'fr' ? 'Secret API' : 'API Secret'} (optionnel)
              </Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="••••••••"
                value={config.apiSecret || ''}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {integration 
              ? (language === 'fr' ? 'Modifier l\'Intégration' : 'Edit Integration')
              : (language === 'fr' ? 'Nouvelle Intégration' : 'New Integration')}
          </DialogTitle>
          <DialogDescription>
            {language === 'fr' 
              ? 'Configurez votre intégration pour connecter vos outils'
              : 'Configure your integration to connect your tools'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="integration-type">
              {language === 'fr' ? 'Type d\'Intégration' : 'Integration Type'} *
            </Label>
            <Select 
              value={type} 
              onValueChange={(v) => {
                setType(v as IntegrationType);
                setConfig({}); // Reset config when type changes
              }}
              disabled={!!integration}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="api">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="integration-name">
              {language === 'fr' ? 'Nom' : 'Name'} *
            </Label>
            <Input
              id="integration-name"
              placeholder={language === 'fr' ? 'Mon Intégration Jira' : 'My Jira Integration'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="integration-description">
              {language === 'fr' ? 'Description' : 'Description'} (optionnel)
            </Label>
            <Textarea
              id="integration-description"
              placeholder={language === 'fr' ? 'Description de l\'intégration...' : 'Integration description...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">
              {language === 'fr' ? 'Configuration' : 'Configuration'}
            </h3>
            {renderConfigFields()}
          </div>

          {type === 'slack' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {language === 'fr' 
                  ? '✅ Slack Webhook est fonctionnel ! Vous pouvez envoyer des notifications réelles à Slack. Les autres intégrations sont en cours de développement.'
                  : '✅ Slack Webhook is functional! You can send real notifications to Slack. Other integrations are under development.'}
              </AlertDescription>
            </Alert>
          )}
          {type !== 'slack' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {language === 'fr' 
                  ? '⚠️ Cette intégration est en cours de développement (Beta). Seule l\'intégration Slack Webhook est actuellement fonctionnelle.'
                  : '⚠️ This integration is under development (Beta). Only Slack Webhook integration is currently functional.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {integration 
              ? (language === 'fr' ? 'Enregistrer' : 'Save')
              : (language === 'fr' ? 'Créer' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

