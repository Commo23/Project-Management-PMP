import { Integration, IntegrationConfig } from '@/types/integrations';
import { Task, Risk, Stakeholder } from '@/types/project';

export interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  channel?: string;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
}

export class SlackService {
  private webhookUrl: string;
  private channel?: string;

  constructor(config: IntegrationConfig) {
    if (!config.slackWebhookUrl) {
      throw new Error('Slack Webhook URL is required');
    }
    this.webhookUrl = config.slackWebhookUrl;
    this.channel = config.slackChannel;
  }

  /**
   * Send a simple text message to Slack
   */
  async sendMessage(text: string): Promise<boolean> {
    try {
      const message: SlackMessage = {
        text,
        channel: this.channel,
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      // Slack webhooks return "ok" as text if successful
      const result = await response.text();
      return result === 'ok' || response.ok;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  /**
   * Send a formatted message with blocks
   */
  async sendFormattedMessage(blocks: SlackBlock[]): Promise<boolean> {
    try {
      const message: SlackMessage = {
        blocks,
        channel: this.channel,
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.text();
      return result === 'ok' || response.ok;
    } catch (error) {
      console.error('Error sending formatted Slack message:', error);
      throw error;
    }
  }

  /**
   * Send notification about a new task
   */
  async notifyTaskCreated(task: Task): Promise<boolean> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📋 New Task Created',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.title}*\n${task.description || 'No description'}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Status:*\n${task.status}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${task.priority}`,
          },
        ],
      },
    ];

    if (task.assignee) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assigned to:* ${task.assignee}`,
        },
      });
    }

    return this.sendFormattedMessage(blocks);
  }

  /**
   * Send notification about a task status change
   */
  async notifyTaskStatusChanged(task: Task, oldStatus: string): Promise<boolean> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔄 Task Status Updated',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.title}*\nStatus changed from *${oldStatus}* to *${task.status}*`,
        },
      },
    ];

    return this.sendFormattedMessage(blocks);
  }

  /**
   * Send notification about a new risk
   */
  async notifyRiskCreated(risk: Risk): Promise<boolean> {
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⚠️ New Risk Identified',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${risk.title}*\n${risk.description || 'No description'}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Probability:*\n${risk.probability}`,
          },
          {
            type: 'mrkdwn',
            text: `*Impact:*\n${risk.impact}`,
          },
          {
            type: 'mrkdwn',
            text: `*Score:*\n${risk.score || 'N/A'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${risk.status}`,
          },
        ],
      },
    ];

    return this.sendFormattedMessage(blocks);
  }

  /**
   * Send daily project summary
   */
  async sendDailySummary(stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeRisks: number;
  }): Promise<boolean> {
    const completionRate = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
      : 0;

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Daily Project Summary',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Tasks:*\n${stats.totalTasks}`,
          },
          {
            type: 'mrkdwn',
            text: `*Completed:*\n${stats.completedTasks} (${completionRate}%)`,
          },
          {
            type: 'mrkdwn',
            text: `*Overdue:*\n${stats.overdueTasks}`,
          },
          {
            type: 'mrkdwn',
            text: `*Active Risks:*\n${stats.activeRisks}`,
          },
        ],
      },
    ];

    if (stats.overdueTasks > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⚠️ *Warning:* ${stats.overdueTasks} task(s) are overdue!`,
        },
      });
    }

    return this.sendFormattedMessage(blocks);
  }

  /**
   * Test the webhook connection
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.sendMessage('✅ PMP Flow Designer integration test - Connection successful!');
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }
}

