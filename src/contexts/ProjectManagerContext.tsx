import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Project, ProjectMetadata, ProjectState } from '@/types/project';
import { createDemoProject } from '@/data/demoProject';

interface ProjectManagerContextType {
  projects: ProjectMetadata[];
  currentProjectId: string | null;
  createProject: (name: string, description?: string, mode?: 'waterfall' | 'agile' | 'hybrid', initialData?: Partial<ProjectState>) => string;
  loadProject: (projectId: string) => ProjectState | null;
  saveProject: (projectId: string, data: ProjectState) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string, newName: string) => string;
  exportProject: (projectId: string) => Project | null;
  importProject: (projectData: Project) => string;
  switchProject: (projectId: string) => void;
  updateProjectMetadata: (projectId: string, updates: Partial<ProjectMetadata>) => void;
}

const ProjectManagerContext = createContext<ProjectManagerContextType | undefined>(undefined);

export function ProjectManagerProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Load projects list from localStorage and create demo project if needed
  useEffect(() => {
    const savedProjects = localStorage.getItem('pmp-projects-list');
    const currentId = localStorage.getItem('pmp-current-project-id');
    const demoProjectId = 'demo-project-pmp-flow-designer';
    
    let projectsList: ProjectMetadata[] = [];
    
    if (savedProjects) {
      try {
        projectsList = JSON.parse(savedProjects);
        setProjects(projectsList);
      } catch (e) {
        console.error('Error loading projects list:', e);
      }
    }
    
    // Check if demo project exists
    const demoProjectExists = projectsList.some(p => p.id === demoProjectId);
    const demoProjectDataExists = localStorage.getItem(`pmp-project-${demoProjectId}`);
    
    // Create demo project if it doesn't exist
    if (!demoProjectExists || !demoProjectDataExists) {
      const demoProject = createDemoProject();
      
      // Save demo project data
      localStorage.setItem(`pmp-project-${demoProjectId}`, JSON.stringify(demoProject));
      
      // Create metadata
      const metadata: ProjectMetadata = {
        id: demoProjectId,
        name: demoProject.name,
        description: demoProject.description,
        mode: demoProject.mode,
        createdAt: demoProject.createdAt,
        updatedAt: demoProject.updatedAt,
        taskCount: demoProject.data.tasks?.length || 0,
        riskCount: demoProject.data.risks?.length || 0,
        stakeholderCount: demoProject.data.stakeholders?.length || 0,
        teamMemberCount: demoProject.data.teamMembers?.length || 0,
      };
      
      // Add to projects list if not already there
      if (!demoProjectExists) {
        const updatedProjects = [metadata, ...projectsList];
        setProjects(updatedProjects);
        localStorage.setItem('pmp-projects-list', JSON.stringify(updatedProjects));
        projectsList = updatedProjects;
      } else {
        // Update existing metadata
        const updatedProjects = projectsList.map(p => 
          p.id === demoProjectId ? metadata : p
        );
        setProjects(updatedProjects);
        localStorage.setItem('pmp-projects-list', JSON.stringify(updatedProjects));
        projectsList = updatedProjects;
      }
    }
    
    // Set current project
    if (currentId) {
      setCurrentProjectId(currentId);
    } else if (projectsList.length > 0) {
      // If no current project, select demo project first, or first available
      const demoProject = projectsList.find(p => p.id === demoProjectId);
      const projectToSelect = demoProject || projectsList[0];
      setCurrentProjectId(projectToSelect.id);
      localStorage.setItem('pmp-current-project-id', projectToSelect.id);
    }
  }, []);

  const createProject = useCallback((name: string, description?: string, mode: 'waterfall' | 'agile' | 'hybrid' = 'waterfall', initialData?: Partial<ProjectState>): string => {
    const projectId = `project-${Date.now()}`;
    const now = new Date().toISOString();
    
    const defaultData: ProjectState = {
      mode,
      phases: [],
      tasks: [],
      backlog: [],
      sprints: [],
      releases: [],
      raci: [],
      wbs: [],
      risks: [],
      stakeholders: [],
      requirements: [],
      ganttTasks: [],
      teamMembers: [],
      customPhases: [],
      taskHistory: [],
      customRoles: [],
    };

    const newProject: Project = {
      id: projectId,
      name,
      description,
      mode,
      createdAt: now,
      updatedAt: now,
      data: {
        ...defaultData,
        ...initialData,
        mode: initialData?.mode || mode,
      },
    };

    localStorage.setItem(`pmp-project-${projectId}`, JSON.stringify(newProject));
    
    const metadata: ProjectMetadata = {
      id: projectId,
      name,
      description,
      mode: newProject.data.mode,
      createdAt: now,
      updatedAt: now,
      taskCount: newProject.data.tasks?.length || 0,
      riskCount: newProject.data.risks?.length || 0,
      stakeholderCount: newProject.data.stakeholders?.length || 0,
      teamMemberCount: newProject.data.teamMembers?.length || 0,
    };

    setProjects(prev => {
      const updated = [...prev, metadata];
      localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
      return updated;
    });

    setCurrentProjectId(projectId);
    localStorage.setItem('pmp-current-project-id', projectId);
    
    return projectId;
  }, []);

  const loadProject = useCallback((projectId: string): ProjectState | null => {
    const saved = localStorage.getItem(`pmp-project-${projectId}`);
    if (saved) {
      try {
        const project: Project = JSON.parse(saved);
        return project.data;
      } catch (e) {
        console.error('Error loading project:', e);
        return null;
      }
    }
    return null;
  }, []);

  const saveProject = useCallback((projectId: string, data: ProjectState) => {
    const saved = localStorage.getItem(`pmp-project-${projectId}`);
    if (saved) {
      try {
        const project: Project = JSON.parse(saved);
        const updated: Project = {
          ...project,
          data,
          mode: data.mode,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`pmp-project-${projectId}`, JSON.stringify(updated));

        // Update metadata
        const metadata: ProjectMetadata = {
          id: projectId,
          name: project.name,
          description: project.description,
          mode: data.mode,
          createdAt: project.createdAt,
          updatedAt: updated.updatedAt,
          taskCount: data.tasks.length,
          riskCount: data.risks.length,
          stakeholderCount: data.stakeholders.length,
          teamMemberCount: data.teamMembers.length,
        };

        setProjects(prev => {
          const updated = prev.map(p => p.id === projectId ? metadata : p);
          localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
          return updated;
        });
      } catch (e) {
        console.error('Error saving project:', e);
      }
    }
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    localStorage.removeItem(`pmp-project-${projectId}`);
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
      
      // If deleted project was current, switch to another or clear
      if (currentProjectId === projectId) {
        if (updated.length > 0) {
          setCurrentProjectId(updated[0].id);
          localStorage.setItem('pmp-current-project-id', updated[0].id);
        } else {
          setCurrentProjectId(null);
          localStorage.removeItem('pmp-current-project-id');
        }
      }
      
      return updated;
    });
  }, [currentProjectId]);

  const duplicateProject = useCallback((projectId: string, newName: string): string => {
    const saved = localStorage.getItem(`pmp-project-${projectId}`);
    if (saved) {
      try {
        const project: Project = JSON.parse(saved);
        const newId = `project-${Date.now()}`;
        const now = new Date().toISOString();
        
        const duplicated: Project = {
          ...project,
          id: newId,
          name: newName,
          createdAt: now,
          updatedAt: now,
        };

        localStorage.setItem(`pmp-project-${newId}`, JSON.stringify(duplicated));

        const metadata: ProjectMetadata = {
          id: newId,
          name: newName,
          description: project.description,
          mode: project.mode,
          createdAt: now,
          updatedAt: now,
          taskCount: project.data.tasks.length,
          riskCount: project.data.risks.length,
          stakeholderCount: project.data.stakeholders.length,
          teamMemberCount: project.data.teamMembers.length,
        };

        setProjects(prev => {
          const updated = [...prev, metadata];
          localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
          return updated;
        });

        return newId;
      } catch (e) {
        console.error('Error duplicating project:', e);
        return '';
      }
    }
    return '';
  }, []);

  const exportProject = useCallback((projectId: string): Project | null => {
    const saved = localStorage.getItem(`pmp-project-${projectId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error exporting project:', e);
        return null;
      }
    }
    return null;
  }, []);

  const importProject = useCallback((projectData: Project): string => {
    const newId = `project-${Date.now()}`;
    const now = new Date().toISOString();
    
    const imported: Project = {
      ...projectData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    localStorage.setItem(`pmp-project-${newId}`, JSON.stringify(imported));

    const metadata: ProjectMetadata = {
      id: newId,
      name: projectData.name,
      description: projectData.description,
      mode: projectData.mode,
      createdAt: now,
      updatedAt: now,
      taskCount: projectData.data.tasks.length,
      riskCount: projectData.data.risks.length,
      stakeholderCount: projectData.data.stakeholders.length,
      teamMemberCount: projectData.data.teamMembers.length,
    };

    setProjects(prev => {
      const updated = [...prev, metadata];
      localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
      return updated;
    });

    return newId;
  }, []);

  const switchProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem('pmp-current-project-id', projectId);
  }, []);

  const updateProjectMetadata = useCallback((projectId: string, updates: Partial<ProjectMetadata>) => {
    const saved = localStorage.getItem(`pmp-project-${projectId}`);
    if (saved) {
      try {
        const project: Project = JSON.parse(saved);
        const updated: Project = {
          ...project,
          name: updates.name ?? project.name,
          description: updates.description ?? project.description,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`pmp-project-${projectId}`, JSON.stringify(updated));

        setProjects(prev => {
          const updated = prev.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          });
          localStorage.setItem('pmp-projects-list', JSON.stringify(updated));
          return updated;
        });
      } catch (e) {
        console.error('Error updating project metadata:', e);
      }
    }
  }, []);

  return (
    <ProjectManagerContext.Provider value={{
      projects,
      currentProjectId,
      createProject,
      loadProject,
      saveProject,
      deleteProject,
      duplicateProject,
      exportProject,
      importProject,
      switchProject,
      updateProjectMetadata,
    }}>
      {children}
    </ProjectManagerContext.Provider>
  );
}

export function useProjectManager() {
  const context = useContext(ProjectManagerContext);
  if (context === undefined) {
    throw new Error('useProjectManager must be used within ProjectManagerProvider');
  }
  return context;
}

