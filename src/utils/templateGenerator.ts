import { ProjectState } from '@/types/project';
import { QuestionnaireAnswers } from '@/components/templates/QuestionnaireWizard';

export function generateTemplateFromAnswers(answers: QuestionnaireAnswers): Partial<ProjectState> {
  const mode = answers.methodology === 'not-sure' 
    ? determineBestMode(answers)
    : answers.methodology;

  const template: Partial<ProjectState> = {
    mode,
    phases: [],
    tasks: generateTasks(answers, mode),
    backlog: generateBacklog(answers, mode),
    sprints: generateSprints(answers, mode),
    risks: generateRisks(answers),
    stakeholders: generateStakeholders(answers),
    requirements: generateRequirements(answers),
    wbs: generateWBS(answers),
    teamMembers: generateTeamMembers(answers),
    ganttTasks: [],
    releases: [],
    raci: [],
    customPhases: [],
    taskHistory: [],
    customRoles: [],
  };

  return template;
}

function determineBestMode(answers: QuestionnaireAnswers): 'waterfall' | 'agile' | 'hybrid' {
  // Determine best mode based on project characteristics
  if (answers.complexity === 'very-complex' || answers.projectSize === 'enterprise') {
    return 'hybrid';
  }
  if (answers.projectType === 'software' && answers.teamSize !== '1-5') {
    return 'agile';
  }
  if (answers.timeline === '1-3months' && answers.complexity === 'simple') {
    return 'waterfall';
  }
  return 'hybrid';
}

function generateTasks(answers: QuestionnaireAnswers, mode: 'waterfall' | 'agile' | 'hybrid'): any[] {
  const tasks: any[] = [];
  let order = 1;

  // Common initiation tasks
  tasks.push({
    id: `task-${order++}`,
    title: 'Project Charter Development',
    description: 'Develop and approve project charter with key stakeholders',
    status: 'todo',
    priority: 'critical',
    phaseId: 'initiation',
    order: order - 1,
  });

  // Planning tasks based on project type
  switch (answers.projectType) {
    case 'software':
      tasks.push(
        {
          id: `task-${order++}`,
          title: 'Requirements Gathering',
          description: 'Collect and document all functional and non-functional requirements',
          status: 'todo',
          priority: 'high',
          phaseId: 'planning',
          order: order - 1,
        },
        {
          id: `task-${order++}`,
          title: 'System Architecture Design',
          description: 'Design system architecture and technical specifications',
          status: 'todo',
          priority: 'high',
          phaseId: 'planning',
          order: order - 1,
        }
      );
      break;
    case 'construction':
      tasks.push(
        {
          id: `task-${order++}`,
          title: 'Site Survey and Permits',
          description: 'Conduct site survey and obtain necessary permits',
          status: 'todo',
          priority: 'critical',
          phaseId: 'planning',
          order: order - 1,
        },
        {
          id: `task-${order++}`,
          title: 'Contractor Selection',
          description: 'Select and contract with construction contractors',
          status: 'todo',
          priority: 'high',
          phaseId: 'planning',
          order: order - 1,
        }
      );
      break;
    case 'marketing':
      tasks.push(
        {
          id: `task-${order++}`,
          title: 'Target Audience Analysis',
          description: 'Analyze and define target audience segments',
          status: 'todo',
          priority: 'high',
          phaseId: 'planning',
          order: order - 1,
        },
        {
          id: `task-${order++}`,
          title: 'Campaign Strategy Development',
          description: 'Develop comprehensive marketing campaign strategy',
          status: 'todo',
          priority: 'high',
          phaseId: 'planning',
          order: order - 1,
        }
      );
      break;
    default:
      tasks.push({
        id: `task-${order++}`,
        title: 'Project Planning',
        description: 'Develop comprehensive project plan',
        status: 'todo',
        priority: 'high',
        phaseId: 'planning',
        order: order - 1,
      });
  }

  // Execution tasks
  if (mode === 'waterfall' || mode === 'hybrid') {
    tasks.push({
      id: `task-${order++}`,
      title: 'Project Execution',
      description: 'Execute project activities according to plan',
      status: 'todo',
      priority: 'high',
      phaseId: 'execution',
      order: order - 1,
    });
  }

  // Monitoring tasks
  tasks.push({
    id: `task-${order++}`,
    title: 'Progress Monitoring',
    description: 'Monitor project progress and performance metrics',
    status: 'todo',
    priority: 'medium',
    phaseId: 'monitoring',
    order: order - 1,
  });

  // Closing tasks
  tasks.push({
    id: `task-${order++}`,
    title: 'Project Closure',
    description: 'Close project and conduct lessons learned',
    status: 'todo',
    priority: 'high',
    phaseId: 'closing',
    order: order - 1,
  });

  return tasks;
}

function generateBacklog(answers: QuestionnaireAnswers, mode: 'waterfall' | 'agile' | 'hybrid'): any[] {
  if (mode === 'waterfall') {
    return [];
  }

  const backlog: any[] = [];
  let order = 1;

  // Generate backlog items based on project type
  switch (answers.projectType) {
    case 'software':
      backlog.push(
        {
          id: `backlog-${order++}`,
          title: 'User Authentication System',
          description: 'Implement secure user authentication and authorization',
          priority: 'high',
          type: 'feature',
          order: order - 1,
          storyPoints: 8,
          userStory: {
            asA: 'user',
            iWant: 'to securely log in to the application',
            soThat: 'I can access my account and data',
          },
        },
        {
          id: `backlog-${order++}`,
          title: 'Core Feature Development',
          description: 'Develop main application features',
          priority: 'high',
          type: 'feature',
          order: order - 1,
          storyPoints: 13,
        }
      );
      break;
    case 'product':
      backlog.push(
        {
          id: `backlog-${order++}`,
          title: 'Product MVP Development',
          description: 'Develop minimum viable product',
          priority: 'critical',
          type: 'epic',
          order: order - 1,
          storyPoints: 21,
        },
        {
          id: `backlog-${order++}`,
          title: 'Market Validation',
          description: 'Validate product-market fit',
          priority: 'high',
          type: 'feature',
          order: order - 1,
          storyPoints: 5,
        }
      );
      break;
    default:
      backlog.push({
        id: `backlog-${order++}`,
        title: 'Initial Feature',
        description: 'First backlog item to get started',
        priority: 'high',
        type: 'story',
        order: order - 1,
        storyPoints: 5,
      });
  }

  return backlog;
}

function generateSprints(answers: QuestionnaireAnswers, mode: 'waterfall' | 'agile' | 'hybrid'): any[] {
  if (mode === 'waterfall') {
    return [];
  }

  const sprints: any[] = [];
  const sprintCount = answers.projectSize === 'small' ? 2 : 
                      answers.projectSize === 'medium' ? 4 :
                      answers.projectSize === 'large' ? 8 : 12;

  const startDate = new Date();
  for (let i = 0; i < sprintCount; i++) {
    const sprintStart = new Date(startDate);
    sprintStart.setDate(sprintStart.getDate() + (i * 14));
    const sprintEnd = new Date(sprintStart);
    sprintEnd.setDate(sprintEnd.getDate() + 13);

    sprints.push({
      id: `sprint-${i + 1}`,
      name: `Sprint ${i + 1}`,
      goal: `Sprint ${i + 1} goals and deliverables`,
      startDate: sprintStart.toISOString().split('T')[0],
      endDate: sprintEnd.toISOString().split('T')[0],
      velocity: 0,
      status: i === 0 ? 'planned' : 'not-started',
    });
  }

  return sprints;
}

function generateRisks(answers: QuestionnaireAnswers): any[] {
  const risks: any[] = [];

  // Common risks
  risks.push({
    id: 'risk-1',
    title: 'Scope Creep',
    description: 'Project scope may expand beyond original requirements',
    probability: answers.complexity === 'very-complex' ? 'high' : 'medium',
    impact: 'high',
    score: answers.complexity === 'very-complex' ? 15 : 10,
    status: 'identified',
    category: 'scope',
  });

  // Budget-related risks
  if (answers.budget === 'low') {
    risks.push({
      id: 'risk-2',
      title: 'Budget Overrun',
      description: 'Project may exceed allocated budget',
      probability: 'medium',
      impact: 'high',
      score: 12,
      status: 'identified',
      category: 'financial',
    });
  }

  // Timeline risks
  if (answers.timeline === '1-3months') {
    risks.push({
      id: 'risk-3',
      title: 'Schedule Compression',
      description: 'Tight timeline may lead to quality compromises',
      probability: 'medium',
      impact: 'medium',
      score: 9,
      status: 'identified',
      category: 'schedule',
    });
  }

  // Resource risks
  if (answers.teamSize === '1-5') {
    risks.push({
      id: 'risk-4',
      title: 'Resource Availability',
      description: 'Limited team size may impact delivery',
      probability: 'medium',
      impact: 'high',
      score: 12,
      status: 'identified',
      category: 'resource',
    });
  }

  return risks;
}

function generateStakeholders(answers: QuestionnaireAnswers): any[] {
  const stakeholders: any[] = [];

  stakeholders.push({
    id: 'stakeholder-1',
    name: 'Project Sponsor',
    role: 'Executive Sponsor',
    influence: 'high',
    interest: 'high',
    engagementLevel: 'manage-closely',
  });

  if (answers.projectType === 'software') {
    stakeholders.push({
      id: 'stakeholder-2',
      name: 'End Users',
      role: 'Primary Users',
      influence: 'medium',
      interest: 'high',
      engagementLevel: 'keep-satisfied',
    });
  }

  if (answers.teamSize !== '1-5') {
    stakeholders.push({
      id: 'stakeholder-3',
      name: 'Project Team',
      role: 'Development Team',
      influence: 'medium',
      interest: 'high',
      engagementLevel: 'manage-closely',
    });
  }

  return stakeholders;
}

function generateRequirements(answers: QuestionnaireAnswers): any[] {
  if (!answers.specificNeeds?.includes('requirements-traceability')) {
    return [];
  }

  return [
    {
      id: 'req-1',
      code: 'REQ-001',
      title: 'Functional Requirements',
      description: 'Core functional requirements for the project',
      type: 'functional',
      priority: 'high',
      status: 'identified',
    },
    {
      id: 'req-2',
      code: 'REQ-002',
      title: 'Non-Functional Requirements',
      description: 'Performance, security, and quality requirements',
      type: 'non-functional',
      priority: 'high',
      status: 'identified',
    },
  ];
}

function generateWBS(answers: QuestionnaireAnswers): any[] {
  if (!answers.specificNeeds?.includes('wbs')) {
    return [];
  }

  return [
    {
      id: 'wbs-1',
      code: '1',
      name: 'Project Management',
      description: 'Project management activities',
      level: 1,
      children: [],
      order: 1,
    },
    {
      id: 'wbs-2',
      code: '2',
      name: 'Project Deliverables',
      description: 'Main project deliverables',
      level: 1,
      children: [],
      order: 2,
    },
  ];
}

function generateTeamMembers(answers: QuestionnaireAnswers): any[] {
  if (!answers.specificNeeds?.includes('team-management')) {
    return [];
  }

  const teamSize = parseInt(answers.teamSize.split('-')[0]);
  const members: any[] = [];

  members.push({
    id: 'team-1',
    name: 'Project Manager',
    role: 'Project Manager',
    status: 'active',
    availability: 100,
  });

  if (answers.projectType === 'software') {
    members.push({
      id: 'team-2',
      name: 'Lead Developer',
      role: 'Technical Lead',
      status: 'active',
      availability: 100,
    });
  }

  return members;
}

