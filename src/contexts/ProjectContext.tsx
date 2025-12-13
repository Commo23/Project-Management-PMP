import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ProjectMode, Phase, Task, BacklogItem, Sprint, Release, 
  RACIEntry, WBSNode, Risk, Stakeholder, Requirement, GanttTask 
} from '@/types/project';
import {
  waterfallPhases, agilePhases, sampleTasks, sampleBacklog, sampleSprints,
  sampleReleases, sampleRaci, sampleWbs, sampleRisks, sampleStakeholders,
  sampleRequirements, sampleGanttTasks
} from '@/data/projectData';

interface ProjectContextType {
  mode: ProjectMode;
  setMode: (mode: ProjectMode) => void;
  phases: Phase[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  backlog: BacklogItem[];
  setBacklog: React.Dispatch<React.SetStateAction<BacklogItem[]>>;
  sprints: Sprint[];
  releases: Release[];
  raci: RACIEntry[];
  setRaci: React.Dispatch<React.SetStateAction<RACIEntry[]>>;
  wbs: WBSNode[];
  setWbs: React.Dispatch<React.SetStateAction<WBSNode[]>>;
  risks: Risk[];
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  stakeholders: Stakeholder[];
  setStakeholders: React.Dispatch<React.SetStateAction<Stakeholder[]>>;
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  ganttTasks: GanttTask[];
  selectedPhase: Phase | null;
  setSelectedPhase: (phase: Phase | null) => void;
  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Backlog CRUD
  addBacklogItem: (item: Omit<BacklogItem, 'id' | 'order'>) => void;
  updateBacklogItem: (itemId: string, updates: Partial<BacklogItem>) => void;
  deleteBacklogItem: (itemId: string) => void;
  moveBacklogItem: (itemId: string, targetSprintId?: string) => void;
  reorderBacklog: (startIndex: number, endIndex: number) => void;
  // Risk CRUD
  addRisk: (risk: Omit<Risk, 'id'>) => void;
  updateRisk: (riskId: string, updates: Partial<Risk>) => void;
  deleteRisk: (riskId: string) => void;
  // Stakeholder CRUD
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => void;
  updateStakeholder: (stakeholderId: string, updates: Partial<Stakeholder>) => void;
  deleteStakeholder: (stakeholderId: string) => void;
  // Requirement CRUD
  addRequirement: (requirement: Omit<Requirement, 'id'>) => void;
  updateRequirement: (requirementId: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (requirementId: string) => void;
  // WBS CRUD
  addWbsNode: (node: Omit<WBSNode, 'id'>) => void;
  updateWbsNode: (nodeId: string, updates: Partial<WBSNode>) => void;
  deleteWbsNode: (nodeId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ProjectMode>('waterfall');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [backlog, setBacklog] = useState<BacklogItem[]>(sampleBacklog);
  const [raci, setRaci] = useState<RACIEntry[]>(sampleRaci);
  const [risks, setRisks] = useState<Risk[]>(sampleRisks);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(sampleStakeholders);
  const [requirements, setRequirements] = useState<Requirement[]>(sampleRequirements);
  const [wbs, setWbs] = useState<WBSNode[]>(sampleWbs);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const phases = mode === 'waterfall' ? waterfallPhases : agilePhases;

  // Task CRUD
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // Backlog CRUD
  const addBacklogItem = useCallback((item: Omit<BacklogItem, 'id' | 'order'>) => {
    setBacklog(prev => {
      const newItem: BacklogItem = {
        ...item,
        id: `b${Date.now()}`,
        order: prev.length,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateBacklogItem = useCallback((itemId: string, updates: Partial<BacklogItem>) => {
    setBacklog(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteBacklogItem = useCallback((itemId: string) => {
    setBacklog(prev => prev.filter(item => item.id !== itemId));
  }, []);

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

  // Risk CRUD
  const addRisk = useCallback((risk: Omit<Risk, 'id'>) => {
    const newRisk: Risk = {
      ...risk,
      id: `r${Date.now()}`,
    };
    setRisks(prev => [...prev, newRisk]);
  }, []);

  const updateRisk = useCallback((riskId: string, updates: Partial<Risk>) => {
    setRisks(prev => prev.map(risk => 
      risk.id === riskId ? { ...risk, ...updates } : risk
    ));
  }, []);

  const deleteRisk = useCallback((riskId: string) => {
    setRisks(prev => prev.filter(risk => risk.id !== riskId));
  }, []);

  // Stakeholder CRUD
  const addStakeholder = useCallback((stakeholder: Omit<Stakeholder, 'id'>) => {
    const newStakeholder: Stakeholder = {
      ...stakeholder,
      id: `s${Date.now()}`,
    };
    setStakeholders(prev => [...prev, newStakeholder]);
  }, []);

  const updateStakeholder = useCallback((stakeholderId: string, updates: Partial<Stakeholder>) => {
    setStakeholders(prev => prev.map(s => 
      s.id === stakeholderId ? { ...s, ...updates } : s
    ));
  }, []);

  const deleteStakeholder = useCallback((stakeholderId: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== stakeholderId));
  }, []);

  // Requirement CRUD
  const addRequirement = useCallback((requirement: Omit<Requirement, 'id'>) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: `req${Date.now()}`,
    };
    setRequirements(prev => [...prev, newRequirement]);
  }, []);

  const updateRequirement = useCallback((requirementId: string, updates: Partial<Requirement>) => {
    setRequirements(prev => prev.map(r => 
      r.id === requirementId ? { ...r, ...updates } : r
    ));
  }, []);

  const deleteRequirement = useCallback((requirementId: string) => {
    setRequirements(prev => prev.filter(r => r.id !== requirementId));
  }, []);

  // WBS CRUD
  const addWbsNode = useCallback((node: Omit<WBSNode, 'id'>) => {
    const newNode: WBSNode = {
      ...node,
      id: `w${Date.now()}`,
    };
    setWbs(prev => [...prev, newNode]);
  }, []);

  const updateWbsNode = useCallback((nodeId: string, updates: Partial<WBSNode>) => {
    setWbs(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteWbsNode = useCallback((nodeId: string) => {
    setWbs(prev => prev.filter(node => node.id !== nodeId));
  }, []);

  return (
    <ProjectContext.Provider value={{
      mode,
      setMode,
      phases,
      tasks,
      setTasks,
      backlog,
      setBacklog,
      sprints: sampleSprints,
      releases: sampleReleases,
      raci,
      setRaci,
      wbs,
      setWbs,
      risks,
      setRisks,
      stakeholders,
      setStakeholders,
      requirements,
      setRequirements,
      ganttTasks: sampleGanttTasks,
      selectedPhase,
      setSelectedPhase,
      addTask,
      updateTask,
      deleteTask,
      addBacklogItem,
      updateBacklogItem,
      deleteBacklogItem,
      moveBacklogItem,
      reorderBacklog,
      addRisk,
      updateRisk,
      deleteRisk,
      addStakeholder,
      updateStakeholder,
      deleteStakeholder,
      addRequirement,
      updateRequirement,
      deleteRequirement,
      addWbsNode,
      updateWbsNode,
      deleteWbsNode,
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
