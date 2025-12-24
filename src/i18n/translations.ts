// PMP/PMBOK Official Translations
// Based on PMBOK Guide 7th Edition and PMI standards

export type Language = 'en' | 'fr';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    clear: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    loading: string;
    error: string;
    success: string;
    actions: string;
    details: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    date: string;
    type: string;
    notes: string;
    export: string;
  };

  // Navigation
  nav: {
    projectFlow: string;
    kanbanBoard: string;
    raciMatrix: string;
    charts: string;
    productBacklog: string;
    wbs: string;
    riskRegister: string;
    stakeholders: string;
    team: string;
    requirements: string;
    timeline: string;
  };

  // Project Modes
  modes: {
    waterfall: string;
    agile: string;
    hybrid: string;
    mode: string;
  };

  // Project Phases (PMBOK)
  phases: {
    initiation: string;
    planning: string;
    execution: string;
    monitoring: string;
    closing: string;
    custom: string;
    inputs: string;
    outputs: string;
    tools: string;
    addCustomPhase: string;
    editPhase: string;
    deletePhase: string;
  };

  // Tasks
  tasks: {
    task: string;
    tasks: string;
    addTask: string;
    editTask: string;
    deleteTask: string;
    assignee: string;
    dueDate: string;
    storyPoints: string;
    estimatedHours: string;
    actualHours: string;
    tags: string;
    history: string;
    comments: string;
    createdBy: string;
    updatedBy: string;
    completedAt: string;
  };

  // Task Status
  taskStatus: {
    backlog: string;
    todo: string;
    inProgress: string;
    review: string;
    done: string;
  };

  // Task Priority
  taskPriority: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };

  // Backlog
  backlog: {
    backlog: string;
    addBacklogItem: string;
    editBacklogItem: string;
    deleteBacklogItem: string;
    userStory: string;
    acceptanceCriteria: string;
    businessValue: string;
    effort: string;
    moscow: string;
    mustHave: string;
    shouldHave: string;
    couldHave: string;
    wontHave: string;
    definitionOfReady: string;
    definitionOfDone: string;
    refinementStatus: string;
    sprints: string;
  };

  // WBS (Work Breakdown Structure)
  wbs: {
    wbs: string;
    workBreakdownStructure: string;
    addWBSNode: string;
    editWBSNode: string;
    deleteWBSNode: string;
    wbsDictionary: string;
    responsible: string;
    budget: string;
    actualCost: string;
    estimatedHours: string;
    actualHours: string;
    startDate: string;
    endDate: string;
    actualStartDate: string;
    actualEndDate: string;
    progress: string;
    milestones: string;
    deliverables: string;
    dependencies: string;
    acceptanceCriteria: string;
    linkedTasks: string;
    linkedBacklogItems: string;
    linkedRequirements: string;
    linkedRisks: string;
  };

  // RACI Matrix
  raci: {
    raciMatrix: string;
    responsible: string;
    accountable: string;
    consulted: string;
    informed: string;
    addRACIEntry: string;
    editRACIEntry: string;
    deleteRACIEntry: string;
    customRoles: string;
    addCustomRole: string;
    deleteCustomRole: string;
    phases: string;
    wbsNodes: string;
    tasks: string;
    deliverables: string;
  };

  // Risk Register
  risks: {
    riskRegister: string;
    addRisk: string;
    editRisk: string;
    deleteRisk: string;
    risk: string;
    risks: string;
    probability: string;
    impact: string;
    score: string;
    category: string;
    rootCauses: string;
    effects: string;
    triggers: string;
    responseStrategy: string;
    responsePlan: string;
    responseActions: string;
    owner: string;
    estimatedCost: string;
    responseCost: string;
    residualRisk: string;
    secondaryRisks: string;
    identifiedDate: string;
    lastReviewDate: string;
    nextReviewDate: string;
    closedDate: string;
    occurredDate: string;
  };

  // Risk Categories
  riskCategories: {
    technical: string;
    external: string;
    organizational: string;
    projectManagement: string;
    resource: string;
    schedule: string;
    budget: string;
    quality: string;
    scope: string;
    stakeholder: string;
    other: string;
  };

  // Risk Response Strategies
  riskResponses: {
    avoid: string;
    mitigate: string;
    transfer: string;
    accept: string;
    exploit: string;
    enhance: string;
    share: string;
  };

  // Stakeholders
  stakeholders: {
    stakeholders: string;
    stakeholder: string;
    addStakeholder: string;
    editStakeholder: string;
    deleteStakeholder: string;
    influence: string;
    interest: string;
    engagementLevel: string;
    needs: string;
    expectations: string;
    concerns: string;
    engagementStrategy: string;
    communicationPreferences: string;
    communicationFrequency: string;
    interactions: string;
    identifiedDate: string;
    lastContactDate: string;
    nextContactDate: string;
    powerInterestMatrix: string;
  };

  // Team
  team: {
    team: string;
    teamManagement: string;
    addTeamMember: string;
    editTeamMember: string;
    deleteTeamMember: string;
    teamMember: string;
    teamMembers: string;
    role: string;
    organization: string;
    manager: string;
    availability: string;
    allocation: string;
    currentWorkload: string;
    capacity: string;
    skills: string;
    certifications: string;
    performanceRating: string;
    lastReviewDate: string;
    startDate: string;
    endDate: string;
    onLeave: string;
    partTime: string;
    offboarded: string;
    active: string;
  };

  // Requirements
  requirements: {
    requirements: string;
    requirement: string;
    requirementsTraceabilityMatrix: string;
    addRequirement: string;
    editRequirement: string;
    deleteRequirement: string;
    source: string;
    rationale: string;
    acceptanceCriteria: string;
    validationMethod: string;
    validationStatus: string;
    validatedBy: string;
    owner: string;
    identifiedDate: string;
    approvedDate: string;
    implementedDate: string;
    verifiedDate: string;
  };

  // Gantt Chart / Timeline
  timeline: {
    timeline: string;
    ganttChart: string;
    addGanttTask: string;
    editGanttTask: string;
    deleteGanttTask: string;
    actualStartDate: string;
    actualEndDate: string;
    dependencies: string;
    resources: string;
  };

  // Statistics
  stats: {
    total: string;
    active: string;
    completed: string;
    inProgress: string;
    onHold: string;
    cancelled: string;
    average: string;
    high: string;
    medium: string;
    low: string;
  };

  // Header
  header: {
    export: string;
    settings: string;
    hideSidebar: string;
    showSidebar: string;
    language: string;
  };

  // Settings
  settings: {
    settings: string;
    general: string;
    project: string;
    display: string;
    advanced: string;
    projectName: string;
    projectDescription: string;
    dateFormat: string;
    timeFormat: string;
    notifications: string;
    autoSave: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
    reset: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      actions: 'Actions',
      details: 'Details',
      name: 'Name',
      description: 'Description',
      status: 'Status',
      priority: 'Priority',
      date: 'Date',
      type: 'Type',
      notes: 'Notes',
      export: 'Export',
    },
    nav: {
      projectFlow: 'Project Flow',
      kanbanBoard: 'Kanban Board',
      raciMatrix: 'RACI Matrix',
      charts: 'Charts',
      productBacklog: 'Product Backlog',
      wbs: 'WBS',
      riskRegister: 'Risk Register',
      stakeholders: 'Stakeholders',
      team: 'Team',
      requirements: 'Requirements',
      timeline: 'Timeline',
    },
    modes: {
      waterfall: 'Waterfall',
      agile: 'Agile',
      hybrid: 'Hybrid',
      mode: 'Mode',
    },
    phases: {
      initiation: 'Project Initiation',
      planning: 'Project Planning',
      execution: 'Project Execution',
      monitoring: 'Monitoring and Controlling',
      closing: 'Project Closing',
      custom: 'Custom Phase',
      inputs: 'Inputs',
      outputs: 'Outputs',
      tools: 'Tools & Techniques',
      addCustomPhase: 'Add Custom Phase',
      editPhase: 'Edit Phase',
      deletePhase: 'Delete Phase',
    },
    tasks: {
      task: 'Task',
      tasks: 'Tasks',
      addTask: 'Add Task',
      editTask: 'Edit Task',
      deleteTask: 'Delete Task',
      assignee: 'Assignee',
      dueDate: 'Due Date',
      storyPoints: 'Story Points',
      estimatedHours: 'Estimated Hours',
      actualHours: 'Actual Hours',
      tags: 'Tags',
      history: 'History',
      comments: 'Comments',
      createdBy: 'Created By',
      updatedBy: 'Updated By',
      completedAt: 'Completed At',
    },
    taskStatus: {
      backlog: 'Backlog',
      todo: 'To Do',
      inProgress: 'In Progress',
      review: 'Review',
      done: 'Done',
    },
    taskPriority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    backlog: {
      backlog: 'Backlog',
      addBacklogItem: 'Add Backlog Item',
      editBacklogItem: 'Edit Backlog Item',
      deleteBacklogItem: 'Delete Backlog Item',
      userStory: 'User Story',
      acceptanceCriteria: 'Acceptance Criteria',
      businessValue: 'Business Value',
      effort: 'Effort',
      moscow: 'MoSCoW',
      mustHave: 'Must Have',
      shouldHave: 'Should Have',
      couldHave: 'Could Have',
      wontHave: "Won't Have",
      definitionOfReady: 'Definition of Ready',
      definitionOfDone: 'Definition of Done',
      refinementStatus: 'Refinement Status',
      sprints: 'Sprints',
    },
    wbs: {
      wbs: 'WBS',
      workBreakdownStructure: 'Work Breakdown Structure',
      addWBSNode: 'Add WBS Node',
      editWBSNode: 'Edit WBS Node',
      deleteWBSNode: 'Delete WBS Node',
      wbsDictionary: 'WBS Dictionary',
      responsible: 'Responsible',
      budget: 'Budget',
      actualCost: 'Actual Cost',
      estimatedHours: 'Estimated Hours',
      actualHours: 'Actual Hours',
      startDate: 'Start Date',
      endDate: 'End Date',
      actualStartDate: 'Actual Start Date',
      actualEndDate: 'Actual End Date',
      progress: 'Progress',
      milestones: 'Milestones',
      deliverables: 'Deliverables',
      dependencies: 'Dependencies',
      acceptanceCriteria: 'Acceptance Criteria',
      linkedTasks: 'Linked Tasks',
      linkedBacklogItems: 'Linked Backlog Items',
      linkedRequirements: 'Linked Requirements',
      linkedRisks: 'Linked Risks',
    },
    raci: {
      raciMatrix: 'RACI Matrix',
      responsible: 'Responsible',
      accountable: 'Accountable',
      consulted: 'Consulted',
      informed: 'Informed',
      addRACIEntry: 'Add RACI Entry',
      editRACIEntry: 'Edit RACI Entry',
      deleteRACIEntry: 'Delete RACI Entry',
      customRoles: 'Custom Roles',
      addCustomRole: 'Add Custom Role',
      deleteCustomRole: 'Delete Custom Role',
      phases: 'Phases',
      wbsNodes: 'WBS Nodes',
      tasks: 'Tasks',
      deliverables: 'Deliverables',
    },
    risks: {
      riskRegister: 'Risk Register',
      addRisk: 'Add Risk',
      editRisk: 'Edit Risk',
      deleteRisk: 'Delete Risk',
      risk: 'Risk',
      risks: 'Risks',
      probability: 'Probability',
      impact: 'Impact',
      score: 'Score',
      category: 'Category',
      rootCauses: 'Root Causes',
      effects: 'Effects',
      triggers: 'Triggers',
      responseStrategy: 'Response Strategy',
      responsePlan: 'Response Plan',
      responseActions: 'Response Actions',
      owner: 'Owner',
      estimatedCost: 'Estimated Cost',
      responseCost: 'Response Cost',
      residualRisk: 'Residual Risk',
      secondaryRisks: 'Secondary Risks',
      identifiedDate: 'Identified Date',
      lastReviewDate: 'Last Review Date',
      nextReviewDate: 'Next Review Date',
      closedDate: 'Closed Date',
      occurredDate: 'Occurred Date',
    },
    riskCategories: {
      technical: 'Technical',
      external: 'External',
      organizational: 'Organizational',
      projectManagement: 'Project Management',
      resource: 'Resource',
      schedule: 'Schedule',
      budget: 'Budget',
      quality: 'Quality',
      scope: 'Scope',
      stakeholder: 'Stakeholder',
      other: 'Other',
    },
    riskResponses: {
      avoid: 'Avoid',
      mitigate: 'Mitigate',
      transfer: 'Transfer',
      accept: 'Accept',
      exploit: 'Exploit',
      enhance: 'Enhance',
      share: 'Share',
    },
    stakeholders: {
      stakeholders: 'Stakeholders',
      stakeholder: 'Stakeholder',
      addStakeholder: 'Add Stakeholder',
      editStakeholder: 'Edit Stakeholder',
      deleteStakeholder: 'Delete Stakeholder',
      influence: 'Influence',
      interest: 'Interest',
      engagementLevel: 'Engagement Level',
      needs: 'Needs',
      expectations: 'Expectations',
      concerns: 'Concerns',
      engagementStrategy: 'Engagement Strategy',
      communicationPreferences: 'Communication Preferences',
      communicationFrequency: 'Communication Frequency',
      interactions: 'Interactions',
      identifiedDate: 'Identified Date',
      lastContactDate: 'Last Contact Date',
      nextContactDate: 'Next Contact Date',
      powerInterestMatrix: 'Power/Interest Matrix',
    },
    team: {
      team: 'Team',
      teamManagement: 'Team Management',
      addTeamMember: 'Add Team Member',
      editTeamMember: 'Edit Team Member',
      deleteTeamMember: 'Delete Team Member',
      teamMember: 'Team Member',
      teamMembers: 'Team Members',
      role: 'Role',
      organization: 'Organization',
      manager: 'Manager',
      availability: 'Availability',
      allocation: 'Allocation (FTE)',
      currentWorkload: 'Current Workload',
      capacity: 'Weekly Capacity (hours)',
      skills: 'Skills',
      certifications: 'Certifications',
      performanceRating: 'Performance Rating',
      lastReviewDate: 'Last Review Date',
      startDate: 'Start Date',
      endDate: 'End Date',
      onLeave: 'On Leave',
      partTime: 'Part-Time',
      offboarded: 'Offboarded',
      active: 'Active',
    },
    requirements: {
      requirements: 'Requirements',
      requirement: 'Requirement',
      requirementsTraceabilityMatrix: 'Requirements Traceability Matrix',
      addRequirement: 'Add Requirement',
      editRequirement: 'Edit Requirement',
      deleteRequirement: 'Delete Requirement',
      source: 'Source',
      rationale: 'Rationale',
      acceptanceCriteria: 'Acceptance Criteria',
      validationMethod: 'Validation Method',
      validationStatus: 'Validation Status',
      validatedBy: 'Validated By',
      owner: 'Owner',
      identifiedDate: 'Identified Date',
      approvedDate: 'Approved Date',
      implementedDate: 'Implemented Date',
      verifiedDate: 'Verified Date',
    },
    timeline: {
      timeline: 'Timeline',
      ganttChart: 'Gantt Chart',
      addGanttTask: 'Add Gantt Task',
      editGanttTask: 'Edit Gantt Task',
      deleteGanttTask: 'Delete Gantt Task',
      actualStartDate: 'Actual Start Date',
      actualEndDate: 'Actual End Date',
      dependencies: 'Dependencies',
      resources: 'Resources',
    },
    stats: {
      total: 'Total',
      active: 'Active',
      completed: 'Completed',
      inProgress: 'In Progress',
      onHold: 'On Hold',
      cancelled: 'Cancelled',
      average: 'Average',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    header: {
      export: 'Export',
      settings: 'Settings',
      hideSidebar: 'Hide sidebar',
      showSidebar: 'Show sidebar',
      language: 'Language',
    },
    settings: {
      settings: 'Settings',
      general: 'General',
      project: 'Project',
      display: 'Display',
      advanced: 'Advanced',
      projectName: 'Project Name',
      projectDescription: 'Project Description',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      notifications: 'Notifications',
      autoSave: 'Auto-save',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      reset: 'Reset',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      clear: 'Effacer',
      close: 'Fermer',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      actions: 'Actions',
      details: 'Détails',
      name: 'Nom',
      description: 'Description',
      status: 'Statut',
      priority: 'Priorité',
      date: 'Date',
      type: 'Type',
      notes: 'Notes',
      export: 'Exporter',
    },
    nav: {
      projectFlow: 'Flux du Projet',
      kanbanBoard: 'Tableau Kanban',
      raciMatrix: 'Matrice RACI',
      charts: 'Graphiques',
      productBacklog: 'Carnet Produit',
      wbs: 'SDP',
      riskRegister: 'Registre des Risques',
      stakeholders: 'Parties Prenantes',
      team: 'Équipe',
      requirements: 'Exigences',
      timeline: 'Calendrier',
    },
    modes: {
      waterfall: 'Cascade',
      agile: 'Agile',
      hybrid: 'Hybride',
      mode: 'Mode',
    },
    phases: {
      initiation: 'Lancement du Projet',
      planning: 'Planification du Projet',
      execution: 'Exécution du Projet',
      monitoring: 'Suivi et Contrôle',
      closing: 'Clôture du Projet',
      custom: 'Phase Personnalisée',
      inputs: 'Intrants',
      outputs: 'Extrants',
      tools: 'Outils et Techniques',
      addCustomPhase: 'Ajouter une Phase Personnalisée',
      editPhase: 'Modifier la Phase',
      deletePhase: 'Supprimer la Phase',
    },
    tasks: {
      task: 'Tâche',
      tasks: 'Tâches',
      addTask: 'Ajouter une Tâche',
      editTask: 'Modifier la Tâche',
      deleteTask: 'Supprimer la Tâche',
      assignee: 'Responsable',
      dueDate: 'Date d\'Échéance',
      storyPoints: 'Points d\'Histoire',
      estimatedHours: 'Heures Estimées',
      actualHours: 'Heures Réelles',
      tags: 'Étiquettes',
      history: 'Historique',
      comments: 'Commentaires',
      createdBy: 'Créé Par',
      updatedBy: 'Mis à Jour Par',
      completedAt: 'Terminé Le',
    },
    taskStatus: {
      backlog: 'En Attente',
      todo: 'À Faire',
      inProgress: 'En Cours',
      review: 'En Révision',
      done: 'Terminé',
    },
    taskPriority: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique',
    },
    backlog: {
      backlog: 'Carnet Produit',
      addBacklogItem: 'Ajouter un Élément',
      editBacklogItem: 'Modifier l\'Élément',
      deleteBacklogItem: 'Supprimer l\'Élément',
      userStory: 'Récit Utilisateur',
      acceptanceCriteria: 'Critères d\'Acceptation',
      businessValue: 'Valeur Métier',
      effort: 'Effort',
      moscow: 'MoSCoW',
      mustHave: 'Doit Avoir',
      shouldHave: 'Devrait Avoir',
      couldHave: 'Pourrait Avoir',
      wontHave: 'N\'Aura Pas',
      definitionOfReady: 'Définition de Prêt',
      definitionOfDone: 'Définition de Terminé',
      refinementStatus: 'Statut d\'Affinage',
      sprints: 'Sprints',
    },
    wbs: {
      wbs: 'SDP',
      workBreakdownStructure: 'Structure de Découpage du Projet',
      addWBSNode: 'Ajouter un Nœud SDP',
      editWBSNode: 'Modifier le Nœud SDP',
      deleteWBSNode: 'Supprimer le Nœud SDP',
      wbsDictionary: 'Dictionnaire SDP',
      responsible: 'Responsable',
      budget: 'Budget',
      actualCost: 'Coût Réel',
      estimatedHours: 'Heures Estimées',
      actualHours: 'Heures Réelles',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      actualStartDate: 'Date de Début Réelle',
      actualEndDate: 'Date de Fin Réelle',
      progress: 'Progression',
      milestones: 'Jalons',
      deliverables: 'Livrables',
      dependencies: 'Dépendances',
      acceptanceCriteria: 'Critères d\'Acceptation',
      linkedTasks: 'Tâches Liées',
      linkedBacklogItems: 'Éléments du Carnet Liés',
      linkedRequirements: 'Exigences Liées',
      linkedRisks: 'Risques Liés',
    },
    raci: {
      raciMatrix: 'Matrice RACI',
      responsible: 'Responsable',
      accountable: 'Comptable',
      consulted: 'Consulté',
      informed: 'Informé',
      addRACIEntry: 'Ajouter une Entrée RACI',
      editRACIEntry: 'Modifier l\'Entrée RACI',
      deleteRACIEntry: 'Supprimer l\'Entrée RACI',
      customRoles: 'Rôles Personnalisés',
      addCustomRole: 'Ajouter un Rôle Personnalisé',
      deleteCustomRole: 'Supprimer le Rôle Personnalisé',
      phases: 'Phases',
      wbsNodes: 'Nœuds SDP',
      tasks: 'Tâches',
      deliverables: 'Livrables',
    },
    risks: {
      riskRegister: 'Registre des Risques',
      addRisk: 'Ajouter un Risque',
      editRisk: 'Modifier le Risque',
      deleteRisk: 'Supprimer le Risque',
      risk: 'Risque',
      risks: 'Risques',
      probability: 'Probabilité',
      impact: 'Impact',
      score: 'Score',
      category: 'Catégorie',
      rootCauses: 'Causes Racines',
      effects: 'Effets',
      triggers: 'Déclencheurs',
      responseStrategy: 'Stratégie de Réponse',
      responsePlan: 'Plan de Réponse',
      responseActions: 'Actions de Réponse',
      owner: 'Propriétaire',
      estimatedCost: 'Coût Estimé',
      responseCost: 'Coût de Réponse',
      residualRisk: 'Risque Résiduel',
      secondaryRisks: 'Risques Secondaires',
      identifiedDate: 'Date d\'Identification',
      lastReviewDate: 'Date de Dernière Révision',
      nextReviewDate: 'Date de Prochaine Révision',
      closedDate: 'Date de Clôture',
      occurredDate: 'Date d\'Occurrence',
    },
    riskCategories: {
      technical: 'Technique',
      external: 'Externe',
      organizational: 'Organisationnel',
      projectManagement: 'Gestion de Projet',
      resource: 'Ressource',
      schedule: 'Calendrier',
      budget: 'Budget',
      quality: 'Qualité',
      scope: 'Portée',
      stakeholder: 'Partie Prenante',
      other: 'Autre',
    },
    riskResponses: {
      avoid: 'Éviter',
      mitigate: 'Atténuer',
      transfer: 'Transférer',
      accept: 'Accepter',
      exploit: 'Exploiter',
      enhance: 'Améliorer',
      share: 'Partager',
    },
    stakeholders: {
      stakeholders: 'Parties Prenantes',
      stakeholder: 'Partie Prenante',
      addStakeholder: 'Ajouter une Partie Prenante',
      editStakeholder: 'Modifier la Partie Prenante',
      deleteStakeholder: 'Supprimer la Partie Prenante',
      influence: 'Influence',
      interest: 'Intérêt',
      engagementLevel: 'Niveau d\'Engagement',
      needs: 'Besoins',
      expectations: 'Attentes',
      concerns: 'Préoccupations',
      engagementStrategy: 'Stratégie d\'Engagement',
      communicationPreferences: 'Préférences de Communication',
      communicationFrequency: 'Fréquence de Communication',
      interactions: 'Interactions',
      identifiedDate: 'Date d\'Identification',
      lastContactDate: 'Date de Dernier Contact',
      nextContactDate: 'Date de Prochain Contact',
      powerInterestMatrix: 'Matrice Pouvoir/Intérêt',
    },
    team: {
      team: 'Équipe',
      teamManagement: 'Gestion de l\'Équipe',
      addTeamMember: 'Ajouter un Membre',
      editTeamMember: 'Modifier le Membre',
      deleteTeamMember: 'Supprimer le Membre',
      teamMember: 'Membre de l\'Équipe',
      teamMembers: 'Membres de l\'Équipe',
      role: 'Rôle',
      organization: 'Organisation',
      manager: 'Gestionnaire',
      availability: 'Disponibilité',
      allocation: 'Allocation (ETP)',
      currentWorkload: 'Charge Actuelle',
      capacity: 'Capacité Hebdomadaire (heures)',
      skills: 'Compétences',
      certifications: 'Certifications',
      performanceRating: 'Note de Performance',
      lastReviewDate: 'Date de Dernière Évaluation',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      onLeave: 'En Congé',
      partTime: 'Temps Partiel',
      offboarded: 'Désengagé',
      active: 'Actif',
    },
    requirements: {
      requirements: 'Exigences',
      requirement: 'Exigence',
      requirementsTraceabilityMatrix: 'Matrice de Traçabilité des Exigences',
      addRequirement: 'Ajouter une Exigence',
      editRequirement: 'Modifier l\'Exigence',
      deleteRequirement: 'Supprimer l\'Exigence',
      source: 'Source',
      rationale: 'Justification',
      acceptanceCriteria: 'Critères d\'Acceptation',
      validationMethod: 'Méthode de Validation',
      validationStatus: 'Statut de Validation',
      validatedBy: 'Validé Par',
      owner: 'Propriétaire',
      identifiedDate: 'Date d\'Identification',
      approvedDate: 'Date d\'Approbation',
      implementedDate: 'Date d\'Implémentation',
      verifiedDate: 'Date de Vérification',
    },
    timeline: {
      timeline: 'Calendrier',
      ganttChart: 'Diagramme de Gantt',
      addGanttTask: 'Ajouter une Tâche Gantt',
      editGanttTask: 'Modifier la Tâche Gantt',
      deleteGanttTask: 'Supprimer la Tâche Gantt',
      actualStartDate: 'Date de Début Réelle',
      actualEndDate: 'Date de Fin Réelle',
      dependencies: 'Dépendances',
      resources: 'Ressources',
    },
    stats: {
      total: 'Total',
      active: 'Actif',
      completed: 'Terminé',
      inProgress: 'En Cours',
      onHold: 'En Attente',
      cancelled: 'Annulé',
      average: 'Moyenne',
      high: 'Élevé',
      medium: 'Moyen',
      low: 'Faible',
    },
    header: {
      export: 'Exporter',
      settings: 'Paramètres',
      hideSidebar: 'Masquer la barre latérale',
      showSidebar: 'Afficher la barre latérale',
      language: 'Langue',
    },
    settings: {
      settings: 'Paramètres',
      general: 'Général',
      project: 'Projet',
      display: 'Affichage',
      advanced: 'Avancé',
      projectName: 'Nom du Projet',
      projectDescription: 'Description du Projet',
      dateFormat: 'Format de Date',
      timeFormat: 'Format d\'Heure',
      notifications: 'Notifications',
      autoSave: 'Enregistrement Automatique',
      theme: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
      reset: 'Réinitialiser',
    },
  },
};

