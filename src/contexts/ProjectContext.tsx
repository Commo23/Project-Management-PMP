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
  risks: Risk[];
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  stakeholders: Stakeholder[];
  requirements: Requirement[];
  ganttTasks: GanttTask[];
  selectedPhase: Phase | null;
  setSelectedPhase: (phase: Phase | null) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveBacklogItem: (itemId: string, targetSprintId?: string) => void;
  reorderBacklog: (startIndex: number, endIndex: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ProjectMode>('waterfall');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [backlog, setBacklog] = useState<BacklogItem[]>(sampleBacklog);
  const [raci, setRaci] = useState<RACIEntry[]>(sampleRaci);
  const [risks, setRisks] = useState<Risk[]>(sampleRisks);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const phases = mode === 'waterfall' ? waterfallPhases : agilePhases;

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
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
      wbs: sampleWbs,
      risks,
      setRisks,
      stakeholders: sampleStakeholders,
      requirements: sampleRequirements,
      ganttTasks: sampleGanttTasks,
      selectedPhase,
      setSelectedPhase,
      updateTask,
      moveBacklogItem,
      reorderBacklog,
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
