import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  ProjectMode, Phase, Task, BacklogItem, Sprint, Release, 
  RACIEntry, WBSNode, Risk, Stakeholder, Requirement, GanttTask,
  TaskTag, TaskHistoryEntry, RiskProbability, RiskImpact, StakeholderInteraction,
  TeamMember, ProjectState
} from '@/types/project';
import {
  waterfallPhases, agilePhases, hybridPhases, sampleTasks, sampleBacklog, sampleSprints,
  sampleReleases, sampleRaci, sampleWbs, sampleRisks, sampleStakeholders,
  sampleRequirements, sampleGanttTasks, sampleTags, sampleTeamMembers
} from '@/data/projectData';
import { useProjectManager } from './ProjectManagerContext';
import { useSettings } from './SettingsContext';

interface ProjectContextType {
  mode: ProjectMode;
  setMode: (mode: ProjectMode) => void;
  phases: Phase[];
  customPhases: Phase[];
  setCustomPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  addCustomPhase: (phase: Omit<Phase, 'id' | 'order' | 'isCustom'>, insertAfterPhaseId?: string) => void;
  updatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  deletePhase: (phaseId: string) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  backlog: BacklogItem[];
  setBacklog: React.Dispatch<React.SetStateAction<BacklogItem[]>>;
  sprints: Sprint[];
  releases: Release[];
  raci: RACIEntry[];
  setRaci: React.Dispatch<React.SetStateAction<RACIEntry[]>>;
  addRACIEntry: (entry: Omit<RACIEntry, 'id'>) => void;
  updateRACIEntry: (entryId: string, updates: Partial<RACIEntry>) => void;
  deleteRACIEntry: (entryId: string) => void;
  customRoles: string[];
  setCustomRoles: React.Dispatch<React.SetStateAction<string[]>>;
  addCustomRole: (role: string) => void;
  deleteCustomRole: (role: string) => void;
  wbs: WBSNode[];
  setWbs: React.Dispatch<React.SetStateAction<WBSNode[]>>;
  addWBSNode: (node: Omit<WBSNode, 'id' | 'code' | 'level' | 'children'>, parentId?: string) => void;
  updateWBSNode: (nodeId: string, updates: Partial<WBSNode>) => void;
  deleteWBSNode: (nodeId: string) => void;
  risks: Risk[];
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  addRisk: (risk: Omit<Risk, 'id' | 'score'>) => void;
  updateRisk: (riskId: string, updates: Partial<Risk>) => void;
  deleteRisk: (riskId: string) => void;
  calculateRiskScore: (probability: RiskProbability, impact: RiskImpact) => number;
  stakeholders: Stakeholder[];
  setStakeholders: React.Dispatch<React.SetStateAction<Stakeholder[]>>;
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => void;
  updateStakeholder: (stakeholderId: string, updates: Partial<Stakeholder>) => void;
  deleteStakeholder: (stakeholderId: string) => void;
  addStakeholderInteraction: (stakeholderId: string, interaction: Omit<StakeholderInteraction, 'id'>) => void;
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  addRequirement: (requirement: Omit<Requirement, 'id' | 'code'>) => void;
  updateRequirement: (requirementId: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (requirementId: string) => void;
  generateRequirementCode: (type: Requirement['type']) => string;
  ganttTasks: GanttTask[];
  setGanttTasks: React.Dispatch<React.SetStateAction<GanttTask[]>>;
  addGanttTask: (task: Omit<GanttTask, 'id'>) => void;
  updateGanttTask: (taskId: string, updates: Partial<GanttTask>) => void;
  deleteGanttTask: (taskId: string) => void;
  selectedPhase: Phase | null;
  setSelectedPhase: (phase: Phase | null) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTaskHistory: (entry: Omit<TaskHistoryEntry, 'id' | 'timestamp'>) => void;
  taskTags: TaskTag[];
  taskHistory: TaskHistoryEntry[];
  moveBacklogItem: (itemId: string, targetSprintId?: string) => void;
  reorderBacklog: (startIndex: number, endIndex: number) => void;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (memberId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentProjectId, loadProject, saveProject } = useProjectManager();
  const { settings } = useSettings();
  
  const [mode, setMode] = useState<ProjectMode>('waterfall');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [backlog, setBacklog] = useState<BacklogItem[]>(sampleBacklog);
  const [raci, setRaci] = useState<RACIEntry[]>(sampleRaci);
  const [risks, setRisks] = useState<Risk[]>(sampleRisks);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [customPhases, setCustomPhases] = useState<Phase[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const [wbs, setWbs] = useState<WBSNode[]>(sampleWbs);
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(sampleStakeholders);
  const [requirements, setRequirements] = useState<Requirement[]>(sampleRequirements);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(sampleGanttTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [sprints] = useState<Sprint[]>(sampleSprints);
  const [releases] = useState<Release[]>(sampleReleases);

  // Load project data from ProjectManager when currentProjectId changes
  useEffect(() => {
    if (currentProjectId) {
      const projectData = loadProject(currentProjectId);
      if (projectData) {
        setMode(projectData.mode || 'waterfall');
        setTasks(projectData.tasks || []);
        setBacklog(projectData.backlog || []);
        setRaci(projectData.raci || []);
        setRisks(projectData.risks || []);
        setCustomPhases(projectData.customPhases || []);
        setTaskHistory(projectData.taskHistory || []);
        setWbs(projectData.wbs || []);
        setCustomRoles(projectData.customRoles || []);
        setStakeholders(projectData.stakeholders || []);
        setRequirements(projectData.requirements || []);
        setGanttTasks(projectData.ganttTasks || []);
        setTeamMembers(projectData.teamMembers || []);
      }
    }
  }, [currentProjectId, loadProject]);

  // Auto-save project data to ProjectManager
  useEffect(() => {
    if (!currentProjectId || !settings.autoSave) return;

    const autoSaveInterval = setInterval(() => {
      const projectState: ProjectState = {
        mode,
        phases: [],
        tasks,
        backlog,
        sprints,
        releases,
        raci,
        wbs,
        risks,
        stakeholders,
        requirements,
        ganttTasks,
        teamMembers,
        customPhases,
        taskHistory,
        customRoles,
      };
      saveProject(currentProjectId, projectState);
    }, settings.autoSaveInterval * 1000);

    return () => clearInterval(autoSaveInterval);
  }, [currentProjectId, mode, tasks, backlog, raci, wbs, risks, stakeholders, requirements, ganttTasks, teamMembers, customPhases, taskHistory, customRoles, sprints, releases, saveProject, settings.autoSave, settings.autoSaveInterval]);

  // Get base phases based on mode
  const basePhases = mode === 'waterfall' 
    ? waterfallPhases 
    : mode === 'agile' 
    ? agilePhases 
    : hybridPhases;

  // Combine base phases with custom phases, sorted by order
  const allPhases = [...basePhases, ...customPhases].sort((a, b) => a.order - b.order);

  const addCustomPhase = useCallback((phaseData: Omit<Phase, 'id' | 'order' | 'isCustom'>, insertAfterPhaseId?: string) => {
    setCustomPhases(prev => {
      const allCurrentPhases = [...basePhases, ...prev].sort((a, b) => a.order - b.order);
      
      let insertPosition: number;
      
      if (!insertAfterPhaseId || insertAfterPhaseId === 'end') {
        // Insert at the end
        insertPosition = allCurrentPhases.length;
      } else {
        // Find the position to insert after
        const insertAfterIndex = allCurrentPhases.findIndex(p => p.id === insertAfterPhaseId);
        insertPosition = insertAfterIndex !== -1 ? insertAfterIndex + 1 : allCurrentPhases.length;
      }
      
      // Create new phase with fractional order for insertion
      const newPhase: Phase = {
        ...phaseData,
        id: `custom-${Date.now()}`,
        order: insertPosition + 0.5, // Use fractional order to insert between phases
        isCustom: true,
        type: phaseData.type || 'custom',
      };
      
      // Add new phase
      const updatedPhases = [...prev, newPhase];
      
      // Combine with base phases and sort
      const allPhasesWithNew = [...basePhases, ...updatedPhases].sort((a, b) => a.order - b.order);
      
      // Reorder all custom phases to have proper sequential integer orders
      // while maintaining their relative positions
      return allPhasesWithNew
        .filter(p => p.isCustom)
        .map((p) => {
          // Find position in the sorted array
          const position = allPhasesWithNew.findIndex(ap => ap.id === p.id);
          // Count base phases before this position
          const basePhasesBefore = allPhasesWithNew
            .slice(0, position)
            .filter(bp => !bp.isCustom).length;
          // Count custom phases before this position
          const customPhasesBefore = allPhasesWithNew
            .slice(0, position)
            .filter(cp => cp.isCustom).length;
          
          return { 
            ...p, 
            order: basePhasesBefore + customPhasesBefore + 1 
          };
        });
    });
  }, [basePhases]);

  const updatePhase = useCallback((phaseId: string, updates: Partial<Phase>) => {
    setCustomPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, ...updates } : phase
    ));
  }, []);

  const deletePhase = useCallback((phaseId: string) => {
    setCustomPhases(prev => prev.filter(phase => phase.id !== phaseId));
    if (selectedPhase?.id === phaseId) {
      setSelectedPhase(null);
    }
  }, [selectedPhase]);

  const addTaskHistory = useCallback((entry: Omit<TaskHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: TaskHistoryEntry = {
      ...entry,
      id: `history-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };
    setTaskHistory(prev => [newEntry, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      // Track changes for history
      if (updates.status && updates.status !== task.status) {
        addTaskHistory({
          taskId,
          action: 'status_changed',
          field: 'status',
          oldValue: task.status,
          newValue: updates.status,
          userId: 'current-user',
          userName: 'Current User',
        });
      }
      
      if (updates.priority && updates.priority !== task.priority) {
        addTaskHistory({
          taskId,
          action: 'priority_changed',
          field: 'priority',
          oldValue: task.priority,
          newValue: updates.priority,
          userId: 'current-user',
          userName: 'Current User',
        });
      }
      
      if (updates.assignee && updates.assignee !== task.assignee) {
        addTaskHistory({
          taskId,
          action: 'assigned',
          field: 'assignee',
          oldValue: task.assignee,
          newValue: updates.assignee,
          userId: 'current-user',
          userName: 'Current User',
        });
      }

      return prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      );
    });
  }, [addTaskHistory]);

  const moveBacklogItem = useCallback((itemId: string, targetSprintId?: string) => {
    setBacklog(prev => prev.map(item =>
      item.id === itemId ? { ...item, sprintId: targetSprintId } : item
    ));
  }, []);

  const reorderBacklog = useCallback((startIndex: number, endIndex: number) => {
    setBacklog(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, index) => ({ ...item, order: index }));
    });
  }, []);

  // WBS Management Functions
  const generateWBSCode = useCallback((parentId: string | undefined, currentWbs: WBSNode[]): string => {
    if (!parentId) {
      // Root level - find next available number
      const rootNodes = currentWbs.filter(n => !n.parentId);
      const maxCode = rootNodes.reduce((max, node) => {
        const num = parseInt(node.code) || 0;
        return num > max ? num : max;
      }, 0);
      return `${maxCode + 1}`;
    }
    
    const parent = currentWbs.find(n => n.id === parentId);
    if (!parent) return '1';
    
    const parentSiblings = currentWbs.filter(n => n.parentId === parentId);
    const maxCode = parentSiblings.reduce((max, node) => {
      const parts = node.code.split('.');
      const lastPart = parseInt(parts[parts.length - 1]) || 0;
      return lastPart > max ? lastPart : max;
    }, 0);
    
    return `${parent.code}.${maxCode + 1}`;
  }, []);

  const addWBSNode = useCallback((nodeData: Omit<WBSNode, 'id' | 'code' | 'level' | 'children'>, parentId?: string) => {
    setWbs(prev => {
      const parent = parentId ? prev.find(n => n.id === parentId) : null;
      const level = parent ? (parent.level + 1) : 0;
      const code = generateWBSCode(parentId, prev);
      
      const newNode: WBSNode = {
        ...nodeData,
        id: `wbs-${Date.now()}`,
        code,
        level,
        children: [],
        status: nodeData.status || 'not-started',
        progress: nodeData.progress || 0,
        linkedTasks: nodeData.linkedTasks || [],
        linkedBacklogItems: nodeData.linkedBacklogItems || [],
        linkedRequirements: nodeData.linkedRequirements || [],
        linkedRisks: nodeData.linkedRisks || [],
        deliverables: nodeData.deliverables || [],
        acceptanceCriteria: nodeData.acceptanceCriteria || [],
        dependencies: nodeData.dependencies || [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      
      // Update parent's children array
      if (parentId) {
        return prev.map(node => 
          node.id === parentId 
            ? { ...node, children: [...(node.children || []), newNode.id] }
            : node
        ).concat(newNode);
      }
      
      return [...prev, newNode];
    });
  }, [generateWBSCode]);

  const updateWBSNode = useCallback((nodeId: string, updates: Partial<WBSNode>) => {
    setWbs(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : node
    ));
  }, []);

  const deleteWBSNode = useCallback((nodeId: string) => {
    setWbs(prev => {
      const nodeToDelete = prev.find(n => n.id === nodeId);
      if (!nodeToDelete) return prev;
      
      // Recursively find all children
      const findAllChildren = (id: string): string[] => {
        const directChildren = prev.filter(n => n.parentId === id).map(n => n.id);
        return directChildren.concat(
          directChildren.flatMap(childId => findAllChildren(childId))
        );
      };
      
      const allChildrenIds = findAllChildren(nodeId);
      const idsToDelete = [nodeId, ...allChildrenIds];
      
      // Remove node and all children
      const filtered = prev.filter(n => !idsToDelete.includes(n.id));
      
      // Update parent's children array
      if (nodeToDelete.parentId) {
        return filtered.map(node =>
          node.id === nodeToDelete.parentId
            ? { ...node, children: node.children.filter(id => id !== nodeId) }
            : node
        );
      }
      
      return filtered;
    });
  }, []);

  // RACI Management Functions
  const addRACIEntry = useCallback((entry: Omit<RACIEntry, 'id'>) => {
    const newEntry: RACIEntry = {
      ...entry,
      id: `raci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRaci(prev => [...prev, newEntry]);
  }, []);

  const updateRACIEntry = useCallback((entryId: string, updates: Partial<RACIEntry>) => {
    setRaci(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ));
  }, []);

  const deleteRACIEntry = useCallback((entryId: string) => {
    setRaci(prev => prev.filter(entry => entry.id !== entryId));
  }, []);

  // Custom Roles Management
  const addCustomRole = useCallback((role: string) => {
    if (role.trim() && !customRoles.includes(role.trim())) {
      setCustomRoles(prev => [...prev, role.trim()]);
    }
  }, [customRoles]);

  const deleteCustomRole = useCallback((role: string) => {
    setCustomRoles(prev => prev.filter(r => r !== role));
    // Also remove RACI entries for this role
    setRaci(prev => prev.filter(entry => entry.role !== role));
  }, []);

  // Risk Management Functions
  const calculateRiskScore = useCallback((probability: RiskProbability, impact: RiskImpact): number => {
    const probabilityValues: Record<RiskProbability, number> = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const impactValues: Record<RiskImpact, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return probabilityValues[probability] * impactValues[impact];
  }, []);

  const addRisk = useCallback((riskData: Omit<Risk, 'id' | 'score'>) => {
    const score = calculateRiskScore(riskData.probability, riskData.impact);
    const newRisk: Risk = {
      ...riskData,
      id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      score,
      identifiedDate: riskData.identifiedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRisks(prev => [...prev, newRisk]);
  }, [calculateRiskScore]);

  const updateRisk = useCallback((riskId: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(risk => {
      if (risk.id === riskId) {
        const updated = { ...risk, ...updates };
        // Recalculate score if probability or impact changed
        if (updates.probability || updates.impact) {
          updated.score = calculateRiskScore(
            updates.probability || risk.probability,
            updates.impact || risk.impact
          );
        }
        updated.updatedAt = new Date().toISOString();
        return updated;
      }
      return risk;
    }));
  }, [calculateRiskScore]);

  const deleteRisk = useCallback((riskId: string) => {
    setRisks(prev => prev.filter(risk => risk.id !== riskId));
  }, []);

  // Stakeholder Management Functions
  const addStakeholder = useCallback((stakeholderData: Omit<Stakeholder, 'id'>) => {
    const newStakeholder: Stakeholder = {
      ...stakeholderData,
      id: `stakeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      identifiedDate: stakeholderData.identifiedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStakeholders(prev => [...prev, newStakeholder]);
  }, []);

  const updateStakeholder = useCallback((stakeholderId: string, updates: Partial<Stakeholder>) => {
    setStakeholders(prev => prev.map(stakeholder => {
      if (stakeholder.id === stakeholderId) {
        return { ...stakeholder, ...updates, updatedAt: new Date().toISOString() };
      }
      return stakeholder;
    }));
  }, []);

  const deleteStakeholder = useCallback((stakeholderId: string) => {
    setStakeholders(prev => prev.filter(stakeholder => stakeholder.id !== stakeholderId));
  }, []);

  const addStakeholderInteraction = useCallback((stakeholderId: string, interaction: Omit<StakeholderInteraction, 'id'>) => {
    const newInteraction: StakeholderInteraction = {
      ...interaction,
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setStakeholders(prev => prev.map(stakeholder => {
      if (stakeholder.id === stakeholderId) {
        return {
          ...stakeholder,
          interactions: [...(stakeholder.interactions || []), newInteraction],
          lastContactDate: interaction.date,
          updatedAt: new Date().toISOString(),
        };
      }
      return stakeholder;
    }));
  }, []);

  // Requirement Management Functions
  const generateRequirementCode = useCallback((type: Requirement['type']): string => {
    const prefixMap: Record<Requirement['type'], string> = {
      'functional': 'FR',
      'non-functional': 'NFR',
      'business': 'BR',
      'technical': 'TR',
      'regulatory': 'REG',
      'quality': 'QR',
    };
    const prefix = prefixMap[type] || 'REQ';
    const existingCodes = requirements.filter(r => r.code.startsWith(prefix));
    const nextNumber = existingCodes.length > 0
      ? Math.max(...existingCodes.map(r => {
          const match = r.code.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        })) + 1
      : 1;
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  }, [requirements]);

  const addRequirement = useCallback((requirementData: Omit<Requirement, 'id' | 'code'>) => {
    const code = generateRequirementCode(requirementData.type);
    const newRequirement: Requirement = {
      ...requirementData,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code,
      identifiedDate: requirementData.identifiedDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRequirements(prev => [...prev, newRequirement]);
  }, [generateRequirementCode]);

  const updateRequirement = useCallback((requirementId: string, updates: Partial<Requirement>) => {
    setRequirements(prev => prev.map(requirement => {
      if (requirement.id === requirementId) {
        const updated = { ...requirement, ...updates };
        // Update status dates
        if (updates.status === 'approved' && !updated.approvedDate) {
          updated.approvedDate = new Date().toISOString().split('T')[0];
        }
        if (updates.status === 'implemented' && !updated.implementedDate) {
          updated.implementedDate = new Date().toISOString().split('T')[0];
        }
        if (updates.status === 'verified' && !updated.verifiedDate) {
          updated.verifiedDate = new Date().toISOString().split('T')[0];
        }
        updated.updatedAt = new Date().toISOString();
        return updated;
      }
      return requirement;
    }));
  }, []);

  const deleteRequirement = useCallback((requirementId: string) => {
    setRequirements(prev => prev.filter(requirement => requirement.id !== requirementId));
  }, []);

  // Gantt Task Management Functions
  const addGanttTask = useCallback((taskData: Omit<GanttTask, 'id'>) => {
    const newTask: GanttTask = {
      ...taskData,
      id: `gantt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: taskData.status || 'not-started',
      progress: taskData.progress || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGanttTasks(prev => [...prev, newTask]);
  }, []);

  const updateGanttTask = useCallback((taskId: string, updates: Partial<GanttTask>) => {
    setGanttTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates, updatedAt: new Date().toISOString() };
      }
      return task;
    }));
  }, []);

  const deleteGanttTask = useCallback((taskId: string) => {
    setGanttTasks(prev => {
      // Also remove this task from dependencies of other tasks
      return prev
        .filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          dependencies: task.dependencies?.filter(depId => depId !== taskId),
        }));
    });
  }, []);

  // Team Member Management Functions
  const addTeamMember = useCallback((memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: memberData.status || 'active',
      availability: memberData.availability ?? 100,
      allocation: memberData.allocation ?? 1.0,
      startDate: memberData.startDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTeamMembers(prev => [...prev, newMember]);
  }, []);

  const updateTeamMember = useCallback((memberId: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return { ...member, ...updates, updatedAt: new Date().toISOString() };
      }
      return member;
    }));
  }, []);

  const deleteTeamMember = useCallback((memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  }, []);

  return (
    <ProjectContext.Provider value={{
      mode,
      setMode,
      phases: allPhases,
      customPhases,
      setCustomPhases,
      addCustomPhase,
      updatePhase,
      deletePhase,
      tasks,
      setTasks,
      backlog,
      setBacklog,
      sprints,
      releases,
      raci,
      setRaci,
      addRACIEntry,
      updateRACIEntry,
      deleteRACIEntry,
      customRoles,
      setCustomRoles,
      addCustomRole,
      deleteCustomRole,
      wbs,
      setWbs,
      addWBSNode,
      updateWBSNode,
      deleteWBSNode,
      risks,
      setRisks,
      addRisk,
      updateRisk,
      deleteRisk,
      calculateRiskScore,
      stakeholders,
      setStakeholders,
      addStakeholder,
      updateStakeholder,
      deleteStakeholder,
      addStakeholderInteraction,
      requirements,
      setRequirements,
      addRequirement,
      updateRequirement,
      deleteRequirement,
      generateRequirementCode,
      ganttTasks,
      setGanttTasks,
      addGanttTask,
      updateGanttTask,
      deleteGanttTask,
      selectedPhase,
      setSelectedPhase,
      updateTask,
      addTaskHistory,
      taskTags: sampleTags,
      taskHistory,
      moveBacklogItem,
      reorderBacklog,
      teamMembers,
      setTeamMembers,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
