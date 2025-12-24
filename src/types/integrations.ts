// Integration Types
export type IntegrationType = 'jira' | 'slack' | 'github' | 'microsoft-teams' | 'webhook' | 'api';

export type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description?: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface IntegrationConfig {
  // Jira
  jiraUrl?: string;
  jiraEmail?: string;
  jiraApiToken?: string;
  jiraProjectKey?: string;
  
  // Slack
  slackWebhookUrl?: string;
  slackChannel?: string;
  slackBotToken?: string;
  
  // GitHub
  githubToken?: string;
  githubRepo?: string;
  githubOwner?: string;
  
  // Microsoft Teams
  teamsWebhookUrl?: string;
  
  // Webhook
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
  
  // API
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface IntegrationSync {
  id: string;
  integrationId: string;
  type: 'export' | 'import' | 'bidirectional';
  status: 'success' | 'error' | 'pending';
  entityType: 'task' | 'backlog' | 'risk' | 'stakeholder' | 'requirement';
  entityId: string;
  syncedAt: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  payload: Record<string, any>;
  receivedAt: string;
  processed: boolean;
  processedAt?: string;
  errorMessage?: string;
}

export interface IntegrationMapping {
  id: string;
  integrationId: string;
  localEntityType: string;
  localEntityId: string;
  externalEntityType: string;
  externalEntityId: string;
  syncedAt: string;
}

