import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Integration, IntegrationType, IntegrationStatus, IntegrationConfig, IntegrationSync, WebhookEvent, IntegrationMapping } from '@/types/integrations';
import { SlackService } from '@/services/integrations/slackService';

interface IntegrationContextType {
  integrations: Integration[];
  addIntegration: (type: IntegrationType, name: string, config: IntegrationConfig, description?: string) => string;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  deleteIntegration: (id: string) => void;
  syncIntegration: (id: string) => Promise<boolean>;
  getIntegration: (id: string) => Integration | undefined;
  syncs: IntegrationSync[];
  addSync: (sync: Omit<IntegrationSync, 'id' | 'syncedAt'>) => void;
  webhookEvents: WebhookEvent[];
  addWebhookEvent: (event: Omit<WebhookEvent, 'id' | 'receivedAt' | 'processed'>) => void;
  processWebhookEvent: (eventId: string) => void;
  mappings: IntegrationMapping[];
  addMapping: (mapping: Omit<IntegrationMapping, 'id' | 'syncedAt'>) => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncs, setSyncs] = useState<IntegrationSync[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [mappings, setMappings] = useState<IntegrationMapping[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedIntegrations = localStorage.getItem('pmp-integrations');
    if (savedIntegrations) {
      try {
        setIntegrations(JSON.parse(savedIntegrations));
      } catch (e) {
        console.error('Error loading integrations:', e);
      }
    }

    const savedSyncs = localStorage.getItem('pmp-integration-syncs');
    if (savedSyncs) {
      try {
        setSyncs(JSON.parse(savedSyncs));
      } catch (e) {
        console.error('Error loading syncs:', e);
      }
    }

    const savedWebhooks = localStorage.getItem('pmp-webhook-events');
    if (savedWebhooks) {
      try {
        setWebhookEvents(JSON.parse(savedWebhooks));
      } catch (e) {
        console.error('Error loading webhooks:', e);
      }
    }

    const savedMappings = localStorage.getItem('pmp-integration-mappings');
    if (savedMappings) {
      try {
        setMappings(JSON.parse(savedMappings));
      } catch (e) {
        console.error('Error loading mappings:', e);
      }
    }
  }, []);

  const addIntegration = useCallback((
    type: IntegrationType,
    name: string,
    config: IntegrationConfig,
    description?: string
  ): string => {
    const id = `integration-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();
    
    const newIntegration: Integration = {
      id,
      type,
      name,
      description,
      status: 'pending',
      config,
      createdAt: now,
      updatedAt: now,
    };

    setIntegrations(prev => {
      const updated = [...prev, newIntegration];
      localStorage.setItem('pmp-integrations', JSON.stringify(updated));
      return updated;
    });

    // Auto-validate and activate if config is valid
    setTimeout(() => {
      validateAndActivateIntegration(id);
    }, 500);

    return id;
  }, []);

  const validateAndActivateIntegration = (id: string) => {
    setIntegrations(prev => {
      const updated = prev.map(integration => {
        if (integration.id === id) {
          // Basic validation based on type
          let isValid = false;
          let errorMessage: string | undefined;

          switch (integration.type) {
            case 'jira':
              isValid = !!(integration.config.jiraUrl && integration.config.jiraEmail && integration.config.jiraApiToken);
              if (!isValid) {
                errorMessage = 'Jira URL, Email, and API Token are required';
              }
              break;
            case 'slack':
              isValid = !!(integration.config.slackWebhookUrl || integration.config.slackBotToken);
              if (!isValid) {
                errorMessage = 'Slack Webhook URL or Bot Token is required';
              } else if (integration.config.slackWebhookUrl) {
                // Test Slack webhook connection
                try {
                  const slackService = new SlackService(integration.config);
                  // We'll test async, but for validation we just check URL format
                  const urlPattern = /^https:\/\/hooks\.slack\.com\/services\/.+/;
                  if (!urlPattern.test(integration.config.slackWebhookUrl)) {
                    errorMessage = 'Invalid Slack Webhook URL format';
                    isValid = false;
                  }
                } catch (e) {
                  // URL format validation only, actual connection test happens on sync
                }
              }
              break;
            case 'github':
              isValid = !!(integration.config.githubToken && integration.config.githubRepo);
              if (!isValid) {
                errorMessage = 'GitHub Token and Repository are required';
              }
              break;
            case 'microsoft-teams':
              isValid = !!(integration.config.teamsWebhookUrl);
              if (!isValid) {
                errorMessage = 'Microsoft Teams Webhook URL is required';
              }
              break;
            case 'webhook':
              isValid = !!(integration.config.webhookUrl);
              if (!isValid) {
                errorMessage = 'Webhook URL is required';
              }
              break;
            case 'api':
              isValid = !!(integration.config.apiEndpoint && integration.config.apiKey);
              if (!isValid) {
                errorMessage = 'API Endpoint and Key are required';
              }
              break;
          }

          return {
            ...integration,
            status: isValid ? 'active' : 'error',
            errorMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return integration;
      });
      localStorage.setItem('pmp-integrations', JSON.stringify(updated));
      return updated;
    });
  };

  const updateIntegration = useCallback((id: string, updates: Partial<Integration>) => {
    setIntegrations(prev => {
      const updated = prev.map(integration => {
        if (integration.id === id) {
          const updatedIntegration = {
            ...integration,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Re-validate if config changed
          if (updates.config) {
            setTimeout(() => {
              validateAndActivateIntegration(id);
            }, 500);
          }
          
          return updatedIntegration;
        }
        return integration;
      });
      localStorage.setItem('pmp-integrations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteIntegration = useCallback((id: string) => {
    setIntegrations(prev => {
      const updated = prev.filter(integration => integration.id !== id);
      localStorage.setItem('pmp-integrations', JSON.stringify(updated));
      return updated;
    });
    
    // Also delete related syncs and mappings
    setSyncs(prev => {
      const updated = prev.filter(sync => sync.integrationId !== id);
      localStorage.setItem('pmp-integration-syncs', JSON.stringify(updated));
      return updated;
    });
    
    setMappings(prev => {
      const updated = prev.filter(mapping => mapping.integrationId !== id);
      localStorage.setItem('pmp-integration-mappings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addSync = useCallback((syncData: Omit<IntegrationSync, 'id' | 'syncedAt'>) => {
    const newSync: IntegrationSync = {
      ...syncData,
      id: `sync-${Date.now()}-${Math.random()}`,
      syncedAt: new Date().toISOString(),
    };

    setSyncs(prev => {
      const updated = [...prev, newSync];
      localStorage.setItem('pmp-integration-syncs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const syncIntegration = useCallback(async (id: string): Promise<boolean> => {
    const integration = integrations.find(i => i.id === id);
    if (!integration || integration.status !== 'active') {
      return false;
    }

    try {
      // Handle different integration types
      if (integration.type === 'slack' && integration.config.slackWebhookUrl) {
        // Real Slack integration
        const slackService = new SlackService(integration.config);
        const testResult = await slackService.testConnection();
        
        if (!testResult) {
          throw new Error('Failed to connect to Slack. Please check your webhook URL.');
        }

        // Add sync record directly
        const newSync: IntegrationSync = {
          integrationId: id,
          type: 'export',
          status: 'success',
          entityType: 'task',
          entityId: 'test',
          id: `sync-${Date.now()}-${Math.random()}`,
          syncedAt: new Date().toISOString(),
        };

        setSyncs(prev => {
          const updated = [...prev, newSync];
          localStorage.setItem('pmp-integration-syncs', JSON.stringify(updated));
          return updated;
        });
      } else {
        // Simulate sync process for other integrations (not yet implemented)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIntegrations(prev => {
        const updated = prev.map(i => {
          if (i.id === id) {
            return {
              ...i,
              lastSyncAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active',
              errorMessage: undefined,
            };
          }
          return i;
        });
        localStorage.setItem('pmp-integrations', JSON.stringify(updated));
        return updated;
      });

      return true;
    } catch (error) {
      setIntegrations(prev => {
        const updated = prev.map(i => {
          if (i.id === id) {
            return {
              ...i,
              status: 'error',
              errorMessage: error instanceof Error ? error.message : 'Sync failed',
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        });
        localStorage.setItem('pmp-integrations', JSON.stringify(updated));
        return updated;
      });
      return false;
    }
  }, [integrations]);

  const getIntegration = useCallback((id: string): Integration | undefined => {
    return integrations.find(i => i.id === id);
  }, [integrations]);

  const addWebhookEvent = useCallback((eventData: Omit<WebhookEvent, 'id' | 'receivedAt' | 'processed'>) => {
    const newEvent: WebhookEvent = {
      ...eventData,
      id: `webhook-${Date.now()}-${Math.random()}`,
      receivedAt: new Date().toISOString(),
      processed: false,
    };

    setWebhookEvents(prev => {
      const updated = [...prev, newEvent];
      localStorage.setItem('pmp-webhook-events', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const processWebhookEvent = useCallback((eventId: string) => {
    setWebhookEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            processed: true,
            processedAt: new Date().toISOString(),
          };
        }
        return event;
      });
      localStorage.setItem('pmp-webhook-events', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMapping = useCallback((mappingData: Omit<IntegrationMapping, 'id' | 'syncedAt'>) => {
    const newMapping: IntegrationMapping = {
      ...mappingData,
      id: `mapping-${Date.now()}-${Math.random()}`,
      syncedAt: new Date().toISOString(),
    };

    setMappings(prev => {
      const updated = [...prev, newMapping];
      localStorage.setItem('pmp-integration-mappings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <IntegrationContext.Provider value={{
      integrations,
      addIntegration,
      updateIntegration,
      deleteIntegration,
      syncIntegration,
      getIntegration,
      syncs,
      addSync,
      webhookEvents,
      addWebhookEvent,
      processWebhookEvent,
      mappings,
      addMapping,
    }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within IntegrationProvider');
  }
  return context;
}

