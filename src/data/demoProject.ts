import { Project, ProjectState } from '@/types/project';
import {
  waterfallPhases,
  agilePhases,
  hybridPhases,
  sampleTasks,
  sampleBacklog,
  sampleSprints,
  sampleReleases,
  sampleRaci,
  sampleWbs,
  sampleRisks,
  sampleStakeholders,
  sampleRequirements,
  sampleGanttTasks,
  sampleTags,
  sampleTeamMembers,
} from './projectData';

export function createDemoProject(): Project {
  const now = new Date().toISOString();
  const demoProjectId = 'demo-project-pmp-flow-designer';

  const demoData: ProjectState = {
    mode: 'hybrid',
    phases: hybridPhases,
    tasks: sampleTasks,
    backlog: sampleBacklog,
    sprints: sampleSprints,
    releases: sampleReleases,
    raci: sampleRaci,
    wbs: sampleWbs,
    risks: sampleRisks,
    stakeholders: sampleStakeholders,
    requirements: sampleRequirements,
    ganttTasks: sampleGanttTasks,
    teamMembers: sampleTeamMembers,
    customPhases: [],
    taskHistory: [],
    customRoles: [],
  };

  const demoProject: Project = {
    id: demoProjectId,
    name: 'Demo Project - PMP Flow Designer',
    description: 'Demonstration project with complete data to explore all PMP Flow Designer features. This project includes phases, tasks, backlog, risks, stakeholders, requirements, WBS, RACI, team members, and more. / Projet de démonstration avec des données complètes pour explorer toutes les fonctionnalités de PMP Flow Designer. Ce projet inclut des phases, tâches, backlog, risques, parties prenantes, exigences, WBS, RACI, équipe et plus encore.',
    mode: 'hybrid',
    createdAt: now,
    updatedAt: now,
    data: demoData,
  };

  return demoProject;
}

