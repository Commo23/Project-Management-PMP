// Project Mode Types
export type ProjectMode = 'waterfall' | 'agile' | 'hybrid';

// Phase Types
export type PhaseType = 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closing' | 'custom';

export interface Phase {
  id: string;
  name: string;
  type: PhaseType;
  description: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  order: number;
  isCustom?: boolean; // Indicates if this is a user-added custom phase
}

// Task Types
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'tag_added' | 'tag_removed' | 'priority_changed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
  comment?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  phaseId: string;
  assignee?: string;
  assigneeId?: string;
  storyPoints?: number;
  sprintId?: string;
  dueDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[]; // Tag IDs
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Backlog Item Types (PMBOK/Agile aligned)
export type BacklogItemType = 'epic' | 'feature' | 'story' | 'bug' | 'technical' | 'spike';
export type BacklogItemStatus = 'draft' | 'refined' | 'ready' | 'in-sprint' | 'done' | 'archived';
export type PrioritizationMethod = 'moscow' | 'value-based' | 'risk-based' | 'kano' | 'custom';
export type MoSCoW = 'must-have' | 'should-have' | 'could-have' | 'won\'t-have';
export type EstimationMethod = 'story-points' | 't-shirt' | 'hours' | 'ideal-days';

export interface AcceptanceCriterion {
  id: string;
  description: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface UserStory {
  asA: string; // As a [user type]
  iWant: string; // I want [functionality]
  soThat: string; // So that [benefit]
}

export interface BacklogItemDependency {
  itemId: string;
  type: 'blocks' | 'blocked-by' | 'related-to';
  description?: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  userStory?: UserStory; // User Story format (As a... I want... So that...)
  acceptanceCriteria?: AcceptanceCriterion[];
  storyPoints?: number;
  tShirtSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  estimatedHours?: number;
  actualHours?: number;
  priority: TaskPriority;
  moscow?: MoSCoW; // MoSCoW prioritization
  businessValue?: number; // 1-10 scale
  effort?: number; // 1-10 scale (for Value/Effort matrix)
  risk?: 'low' | 'medium' | 'high';
  type: BacklogItemType;
  status?: BacklogItemStatus;
  epicId?: string; // Link to parent Epic
  parentId?: string; // For feature/story hierarchy
  sprintId?: string;
  releaseId?: string;
  order: number;
  tags?: string[];
  dependencies?: BacklogItemDependency[];
  definitionOfReady?: string[]; // Checklist items
  definitionOfDone?: string[]; // Checklist items
  refinementStatus?: 'not-started' | 'in-progress' | 'complete';
  lastRefinedAt?: string;
  refinedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  assignee?: string;
  assigneeId?: string;
  notes?: string;
  businessJustification?: string;
  stakeholders?: string[];
  relatedRequirements?: string[]; // Requirement IDs
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
export type RACIEntityType = 'phase' | 'wbs' | 'task' | 'deliverable';

export interface RACIEntry {
  id?: string; // Unique identifier for the entry
  entityType: RACIEntityType; // Type of entity (phase, wbs, task, deliverable)
  entityId: string; // ID of the entity (phaseId, wbsNodeId, taskId, etc.)
  role: string; // Role name
  responsibility: RACIRole;
  notes?: string; // Optional notes
  createdAt?: string;
  updatedAt?: string;
}

// WBS Types (PMBOK aligned)
export interface WBSNode {
  id: string;
  code: string;
  name: string;
  description: string;
  parentId?: string;
  children: string[];
  level: number;
  // PMBOK fields
  phaseId?: string; // Link to project phase
  responsible?: string; // Responsible person/role
  budget?: number; // Budget allocated
  actualCost?: number; // Actual cost incurred
  estimatedHours?: number; // Estimated work hours
  actualHours?: number; // Actual work hours
  startDate?: string; // Planned start date
  endDate?: string; // Planned end date
  actualStartDate?: string; // Actual start date
  actualEndDate?: string; // Actual end date
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress?: number; // 0-100 percentage
  // Synchronization links
  linkedTasks?: string[]; // Task IDs
  linkedBacklogItems?: string[]; // Backlog item IDs
  linkedRequirements?: string[]; // Requirement IDs
  linkedRisks?: string[]; // Risk IDs
  deliverables?: string[]; // Deliverables list
  acceptanceCriteria?: string[]; // Acceptance criteria
  dependencies?: string[]; // WBS node IDs this depends on
  milestones?: boolean; // Is this a milestone?
  createdAt?: string;
  updatedAt?: string;
}

// Risk Types (PMBOK aligned)
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 
  | 'technical' 
  | 'external' 
  | 'organizational' 
  | 'project-management' 
  | 'resource' 
  | 'schedule' 
  | 'budget' 
  | 'quality' 
  | 'scope' 
  | 'stakeholder'
  | 'other';
export type RiskResponseStrategy = 'avoid' | 'mitigate' | 'transfer' | 'accept' | 'exploit' | 'enhance' | 'share';
export type RiskStatus = 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed' | 'occurred';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category?: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  score: number; // Calculated: probability * impact
  rootCauses?: string[]; // Root causes of the risk
  effects?: string[]; // Potential effects/consequences
  triggers?: string[]; // Early warning indicators/triggers
  response: RiskResponseStrategy;
  responsePlan?: string; // Detailed response plan
  responseActions?: RiskAction[]; // Specific actions to address the risk
  owner: string; // Risk owner
  status: RiskStatus;
  estimatedCost?: number; // Estimated cost if risk occurs
  responseCost?: number; // Cost of implementing response strategy
  residualRisk?: string; // Description of residual risk after response
  secondaryRisks?: string[]; // IDs of secondary risks created by response
  linkedPhaseId?: string; // Link to project phase
  linkedWBSNodeId?: string; // Link to WBS node
  linkedTaskIds?: string[]; // Links to related tasks
  linkedRequirementIds?: string[]; // Links to requirements
  identifiedDate?: string; // Date risk was identified (YYYY-MM-DD)
  lastReviewDate?: string; // Date of last review (YYYY-MM-DD)
  nextReviewDate?: string; // Date of next scheduled review (YYYY-MM-DD)
  closedDate?: string; // Date risk was closed (YYYY-MM-DD)
  occurredDate?: string; // Date risk actually occurred (YYYY-MM-DD)
  notes?: string; // Additional notes
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskAction {
  id: string;
  description: string;
  owner: string;
  dueDate?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: string;
}

// Stakeholder Types (PMBOK aligned)
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  engagementLevel: 'unaware' | 'resistant' | 'neutral' | 'supportive' | 'leading';
  // Contact Information
  email?: string;
  phone?: string;
  address?: string;
  // PMBOK Fields
  needs?: string[]; // Stakeholder needs
  expectations?: string[]; // Stakeholder expectations
  concerns?: string[]; // Stakeholder concerns
  requirements?: string[]; // Requirements from this stakeholder
  engagementStrategy?: string; // Strategy for engaging this stakeholder
  communicationPreferences?: string; // Preferred communication methods
  communicationFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed';
  // Links
  linkedPhaseIds?: string[]; // Phases this stakeholder is involved in
  linkedWBSNodeIds?: string[]; // WBS nodes this stakeholder is responsible for
  linkedTaskIds?: string[]; // Tasks assigned to this stakeholder
  linkedRiskIds?: string[]; // Risks this stakeholder is involved in
  linkedRequirementIds?: string[]; // Requirements from this stakeholder
  // Engagement History
  interactions?: StakeholderInteraction[]; // History of interactions
  // Dates
  identifiedDate?: string; // Date stakeholder was identified (YYYY-MM-DD)
  lastContactDate?: string; // Date of last contact (YYYY-MM-DD)
  nextContactDate?: string; // Date of next scheduled contact (YYYY-MM-DD)
  // Additional
  notes?: string; // Additional notes
  createdAt?: string;
  updatedAt?: string;
}

export interface StakeholderInteraction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'meeting' | 'email' | 'phone' | 'presentation' | 'report' | 'other';
  subject: string;
  description?: string;
  outcome?: string;
  nextActions?: string[];
  createdBy?: string;
}

// Requirement Types (PMBOK aligned)
export interface Requirement {
  id: string;
  code: string; // Unique requirement identifier (e.g., FR-001, NFR-001)
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'business' | 'technical' | 'regulatory' | 'quality';
  priority: TaskPriority;
  status: 'draft' | 'approved' | 'implemented' | 'verified' | 'rejected' | 'deferred';
  // PMBOK Fields
  source?: string; // Source of requirement (stakeholder, document, regulation, etc.)
  sourceDocument?: string; // Document reference
  rationale?: string; // Why this requirement exists
  acceptanceCriteria?: string[]; // Criteria that must be met for requirement to be considered satisfied
  validationMethod?: 'testing' | 'inspection' | 'demonstration' | 'analysis' | 'review';
  validationStatus?: 'not-started' | 'in-progress' | 'passed' | 'failed';
  validationDate?: string; // Date requirement was validated (YYYY-MM-DD)
  validatedBy?: string; // Person who validated the requirement
  owner?: string; // Requirement owner
  // Links
  linkedTasks?: string[]; // Tasks that implement this requirement
  linkedBacklogItems?: string[]; // Backlog items related to this requirement
  linkedWBSNodeIds?: string[]; // WBS nodes that deliver this requirement
  linkedPhaseIds?: string[]; // Phases where this requirement is relevant
  linkedStakeholderIds?: string[]; // Stakeholders who requested/need this requirement
  linkedRiskIds?: string[]; // Risks related to this requirement
  parentRequirementId?: string; // Parent requirement (for hierarchical requirements)
  childRequirementIds?: string[]; // Child requirements
  dependencies?: string[]; // IDs of other requirements this one depends on
  // Dates
  identifiedDate?: string; // Date requirement was identified (YYYY-MM-DD)
  approvedDate?: string; // Date requirement was approved (YYYY-MM-DD)
  implementedDate?: string; // Date requirement was implemented (YYYY-MM-DD)
  verifiedDate?: string; // Date requirement was verified (YYYY-MM-DD)
  // Additional
  notes?: string; // Additional notes
  version?: string; // Requirement version
  createdAt?: string;
  updatedAt?: string;
}

// Gantt Chart Types (PMBOK aligned)
export interface GanttTask {
  id: string;
  name: string;
  description?: string;
  startDate: string; // Planned start date (YYYY-MM-DD)
  endDate: string; // Planned end date (YYYY-MM-DD)
  actualStartDate?: string; // Actual start date (YYYY-MM-DD)
  actualEndDate?: string; // Actual end date (YYYY-MM-DD)
  progress: number; // Percentage of completion (0-100)
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  dependencies?: string[]; // IDs of tasks this one depends on
  phaseId?: string; // Link to project phase
  // PMBOK Fields
  type?: 'task' | 'milestone' | 'summary' | 'phase';
  isMilestone?: boolean; // Is this a milestone?
  isSummary?: boolean; // Is this a summary task (parent)?
  parentId?: string; // Parent task ID (for hierarchical tasks)
  children?: string[]; // Child task IDs
  // Resources
  assignedTo?: string; // Person or role assigned
  resources?: string[]; // List of resources assigned
  // Cost
  budget?: number; // Budgeted cost
  actualCost?: number; // Actual cost incurred
  // Links
  linkedTaskIds?: string[]; // Links to regular tasks
  linkedWBSNodeIds?: string[]; // Links to WBS nodes
  linkedBacklogItemIds?: string[]; // Links to backlog items
  linkedRequirementIds?: string[]; // Links to requirements
  linkedRiskIds?: string[]; // Links to risks
  // Additional
  notes?: string; // Additional notes
  createdAt?: string;
  updatedAt?: string;
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

// Team Member Types (PMBOK aligned)
export type TeamMemberRole = 
  | 'project-manager' 
  | 'product-owner' 
  | 'scrum-master' 
  | 'developer' 
  | 'designer' 
  | 'qa-engineer' 
  | 'business-analyst' 
  | 'devops-engineer' 
  | 'architect' 
  | 'technical-lead' 
  | 'ui-ux-designer' 
  | 'data-analyst' 
  | 'other';
export type TeamMemberStatus = 'active' | 'on-leave' | 'offboarded' | 'part-time';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TeamMemberSkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  customRole?: string; // For "other" role
  status: TeamMemberStatus;
  // PMBOK Fields
  organization?: string; // Department/Organization
  manager?: string; // Direct manager
  startDate?: string; // Start date on project (YYYY-MM-DD)
  endDate?: string; // End date on project (YYYY-MM-DD)
  availability?: number; // Percentage availability (0-100)
  allocation?: number; // Full-time equivalent (FTE) - 1.0 = full-time, 0.5 = half-time
  // Skills & Competencies
  skills?: TeamMemberSkill[];
  certifications?: string[]; // PMP, CSM, etc.
  // Workload
  currentWorkload?: number; // Current workload percentage (0-100)
  capacity?: number; // Weekly capacity in hours
  // Links
  linkedTaskIds?: string[]; // Tasks assigned to this member
  linkedWBSNodeIds?: string[]; // WBS nodes this member is responsible for
  linkedPhaseIds?: string[]; // Phases this member is involved in
  linkedRiskIds?: string[]; // Risks this member is involved in
  linkedRequirementIds?: string[]; // Requirements this member is working on
  // Performance
  performanceRating?: number; // 1-5 scale
  lastReviewDate?: string; // Date of last performance review (YYYY-MM-DD)
  // Additional
  notes?: string;
  avatar?: string; // URL to avatar image
  createdAt?: string;
  updatedAt?: string;
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
  teamMembers: TeamMember[];
}
