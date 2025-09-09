import { Project, ProjectFormData, Activity, ActivityFormData, User, TeamMember } from '../types/project'; 
import { mockProjects, mockUsers } from '../data/mockProjects'; 
import { clientApi } from './clientApi'; 

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key
const STORAGE_KEY = 'projects';

// Get projects from localStorage or use mock data
const getStoredProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockProjects;
  } catch {
    return mockProjects;
  }
};

// Save projects to localStorage
const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
};

export const projectApi = {
  // Get all projects
  async getProjects(): Promise<Project[]> {
    await delay(300);
    return getStoredProjects();
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project | null> {
    await delay(200);
    const projects = getStoredProjects();
    return projects.find(project => project.id === id) || null;
  },

  // Create new project
  async createProject(data: ProjectFormData): Promise<Project> {
    await delay(500);
    const projects = getStoredProjects();
    
    // Get client details
    const client = await clientApi.getClientById(data.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Find project manager if provided
    let projectManager = {
      id: '1',
      name: 'Default Manager',
      email: 'default@company.com',
      avatar: '/rectangle-3-1.png',
    };

    if (data.projectManagerId) {
      const users = await this.getUsers();
      const manager = users.find(u => u.id === data.projectManagerId);
      if (manager) {
        projectManager = {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          avatar: manager.avatar,
        };
      }
    }
    
    // Calculate duration
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const duration = `${diffMonths} Month${diffMonths > 1 ? 's' : ''}`;
    
    const newProject: Project = {
      id: Date.now().toString(),
      code: `PM-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: data.name,
      client: {
        id: client.id,
        code: client.code,
        name: client.name,
      },
      type: data.type as any,
      startDate: data.startDate,
      endDate: data.endDate,
      duration,
      billingType: data.billingType as any,
      status: 'Active',
      accountManager: client.manager,
      projectManager,
      assignedTeam: [],
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    
    // Update client's project count
    await clientApi.updateClient(client.id, { 
      projects: client.projects + 1 
    });
    
    return newProject;
  },

  // Update project
  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    // Calculate new duration if dates changed
    let duration = projects[projectIndex].duration;
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      duration = `${diffMonths} Month${diffMonths > 1 ? 's' : ''}`;
    }
    
    // Update project manager if provided
    let projectManager = projects[projectIndex].projectManager;
    if (data.projectManagerId) {
      const users = await this.getUsers();
      const manager = users.find(u => u.id === data.projectManagerId);
      if (manager) {
        projectManager = {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          avatar: manager.avatar,
        };
      }
    }
    
    // Update client if provided
    let client = projects[projectIndex].client;
    if (data.clientId) {
      const clientData = await clientApi.getClientById(data.clientId);
      if (clientData) {
        client = {
          id: clientData.id,
          code: clientData.code,
          name: clientData.name,
        };
      }
    }
    
    const updatedProject = {
      ...projects[projectIndex],
      name: data.name || projects[projectIndex].name,
      client,
      type: data.type as any || projects[projectIndex].type,
      startDate: data.startDate || projects[projectIndex].startDate,
      endDate: data.endDate || projects[projectIndex].endDate,
      duration,
      billingType: data.billingType as any || projects[projectIndex].billingType,
      projectManager,
      updatedAt: new Date().toISOString(),
    };
    
    projects[projectIndex] = updatedProject;
    saveProjects(projects);
    return updatedProject;
  },

  // Update project status
  async updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
    await delay(300);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    projects[projectIndex].status = status;
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
    return projects[projectIndex];
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await delay(300);
    const projects = getStoredProjects();
    const project = projects.find(p => p.id === id);
    
    if (project) {
      // Update client's project count
      const client = await clientApi.getClientById(project.client.id);
      if (client && client.projects > 0) {
        await clientApi.updateClient(client.id, { 
          projects: client.projects - 1 
        });
      }
    }
    
    const filteredProjects = projects.filter(project => project.id !== id);
    saveProjects(filteredProjects);
  },

  // Get all users
  async getUsers(): Promise<User[]> {
    await delay(200);
    return mockUsers;
  },

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    await delay(300);
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Add team member to project
  async addTeamMember(projectId: string, userId: string): Promise<TeamMember> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user is already assigned
    const isAlreadyAssigned = projects[projectIndex].assignedTeam.some(member => member.id === userId);
    if (isAlreadyAssigned) {
      throw new Error('User is already assigned to this project');
    }
    
    const newTeamMember: TeamMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      assignedAt: new Date().toISOString(),
    };
    
    projects[projectIndex].assignedTeam.push(newTeamMember);
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
    return newTeamMember;
  },

  // Remove team member from project
  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    await delay(300);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    projects[projectIndex].assignedTeam = projects[projectIndex].assignedTeam.filter(member => member.id !== userId);
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
  },

  // Add activity to project
  async addActivity(data: ActivityFormData): Promise<Activity> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === data.projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    projects[projectIndex].activities.push(newActivity);
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
    return newActivity;
  },

  // Update activity
  async updateActivity(projectId: string, activityId: string, data: Partial<ActivityFormData>): Promise<Activity> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const activityIndex = projects[projectIndex].activities.findIndex(activity => activity.id === activityId);
    if (activityIndex === -1) {
      throw new Error('Activity not found');
    }
    
    const updatedActivity = {
      ...projects[projectIndex].activities[activityIndex],
      name: data.name || projects[projectIndex].activities[activityIndex].name,
      description: data.description || projects[projectIndex].activities[activityIndex].description,
      updatedAt: new Date().toISOString(),
    };
    
    projects[projectIndex].activities[activityIndex] = updatedActivity;
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
    return updatedActivity;
  },

  // Delete activity
  async deleteActivity(projectId: string, activityId: string): Promise<void> {
    await delay(300);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    projects[projectIndex].activities = projects[projectIndex].activities.filter(activity => activity.id !== activityId);
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
  },

  // Update activity status
  async updateActivityStatus(projectId: string, activityId: string, status: Activity['status']): Promise<Activity> {
    await delay(300);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const activityIndex = projects[projectIndex].activities.findIndex(activity => activity.id === activityId);
    if (activityIndex === -1) {
      throw new Error('Activity not found');
    }
    
    projects[projectIndex].activities[activityIndex].status = status;
    projects[projectIndex].activities[activityIndex].updatedAt = new Date().toISOString();
    projects[projectIndex].updatedAt = new Date().toISOString();
    saveProjects(projects);
    return projects[projectIndex].activities[activityIndex];
  },

  // Search projects
  async searchProjects(query: string): Promise<Project[]> {
    await delay(300);
    const projects = getStoredProjects();
    return projects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.code.toLowerCase().includes(query.toLowerCase()) ||
      project.client.name.toLowerCase().includes(query.toLowerCase()) ||
      project.type.toLowerCase().includes(query.toLowerCase())
    );
  },
};