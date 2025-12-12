// Project Mode Types
export type ProjectMode = 'waterfall' | 'agile';

// Phase Types
export type PhaseType = 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closing';

export interface Phase {
  id: string;
  name: string;
  type: PhaseType;
  description: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  order: number;
}

// Task Types
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  phaseId: string;
  assignee?: string;
  storyPoints?: number;
  sprintId?: string;
  dueDate?: string;
  createdAt: string;
}

// Backlog Item Types
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: TaskPriority;
  type: 'feature' | 'bug' | 'technical' | 'spike';
  sprintId?: string;
  order: number;
}

// Sprint Types
export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  velocity?: number;
  items: string[]; // BacklogItem IDs
}

// Release Types
export interface Release {
  id: string;
  name: string;
  version: string;
  targetDate: string;
  sprints: string[]; // Sprint IDs
  status: 'planned' | 'in-progress' | 'released';
}

// RACI Types
export type RACIRole = 'R' | 'A' | 'C' | 'I' | '';

export interface RACIEntry {
  phaseId: string;
  role: string;
  responsibility: RACIRole;
}

// WBS Types
export interface WBSNode {
  id: string;
  code: string;
  name: string;
  description: string;
  parentId?: string;
  children: string[];
  level: number;
}

// Risk Types
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  score: number;
  response: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  owner: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'closed';
}

// Stakeholder Types
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  engagementLevel: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading';
}

// Requirement Types
export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'business' | 'technical';
  priority: TaskPriority;
  status: 'draft' | 'approved' | 'implemented' | 'verified';
  linkedTasks: string[];
}

// Gantt Chart Types
export interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
  phaseId: string;
  isMilestone?: boolean;
}

// Burndown Data
export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

// Velocity Data
export interface VelocityData {
  sprint: string;
  committed: number;
  completed: number;
}

// Project State
export interface ProjectState {
  mode: ProjectMode;
  phases: Phase[];
  tasks: Task[];
  backlog: BacklogItem[];
  sprints: Sprint[];
  releases: Release[];
  raci: RACIEntry[];
  wbs: WBSNode[];
  risks: Risk[];
  stakeholders: Stakeholder[];
  requirements: Requirement[];
  ganttTasks: GanttTask[];
}
