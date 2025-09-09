import { Task, TaskFormData, TaskProject, TaskUser } from '../types/task';
import { mockTasks, mockTaskProjects, mockTaskUsers } from '../data/mockTasks';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const TASKS_STORAGE_KEY = 'tasks';
const TASK_PROJECTS_STORAGE_KEY = 'taskProjects';
const TASK_USERS_STORAGE_KEY = 'taskUsers';

// Get tasks from localStorage or use mock data
const getStoredTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTasks;
  } catch {
    return mockTasks;
  }
};

// Save tasks to localStorage
const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

// Get projects from localStorage or use mock data
const getStoredProjects = (): TaskProject[] => {
  try {
    const stored = localStorage.getItem(TASK_PROJECTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTaskProjects;
  } catch {
    return mockTaskProjects;
  }
};

// Save projects to localStorage
const saveProjects = (projects: TaskProject[]): void => {
  try {
    localStorage.setItem(TASK_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save task projects:', error);
  }
};

// Get users from localStorage or use mock data
const getStoredUsers = (): TaskUser[] => {
  try {
    const stored = localStorage.getItem(TASK_USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTaskUsers;
  } catch {
    return mockTaskUsers;
  }
};

// Save users to localStorage
const saveUsers = (users: TaskUser[]): void => {
  try {
    localStorage.setItem(TASK_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save task users:', error);
  }
};

export const taskApi = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    await delay(300);
    return getStoredTasks();
  },

  // Get task by ID
  async getTaskById(id: string): Promise<Task | null> {
    await delay(200);
    const tasks = getStoredTasks();
    return tasks.find(task => task.id === id) || null;
  },

  // Create new task
  async createTask(data: TaskFormData): Promise<Task> {
    await delay(500);
    const tasks = getStoredTasks();
    const projects = getStoredProjects();
    const users = getStoredUsers();
    
    // Find project and activity
    const project = projects.find(p => p.id === data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const activity = project.activities.find(a => a.id === data.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    // Find users
    const assignedTo = users.find(u => u.id === data.assignedToId);
    const taskReviewer = users.find(u => u.id === data.taskReviewerId);
    
    if (!assignedTo || !taskReviewer) {
      throw new Error('User not found');
    }

    const newTask: Task = {
      id: Date.now().toString(),
      code: `TSK-${String(tasks.length + 10000).padStart(5, '0')}`,
      name: data.name,
      description: data.description || '',
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
      },
      activity: {
        id: activity.id,
        name: activity.name,
      },
      assignedTo: {
        id: assignedTo.id,
        name: assignedTo.name,
        email: assignedTo.email,
        avatar: assignedTo.avatar,
      },
      assignedBy: users[0], // Default to first user
      taskReviewer: {
        id: taskReviewer.id,
        name: taskReviewer.name,
        email: taskReviewer.email,
        avatar: taskReviewer.avatar,
      },
      priority: data.priority as any,
      status: 'To Do',
      activityType: data.activityType as any,
      startDate: data.startDate,
      dueDate: data.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      frequency: '1 Week',
      plannedHours: data.plannedHours,
      comments: '',
    };
    
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    return newTask;
  },

  // Update task
  async updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
    await delay(400);
    const tasks = getStoredTasks();
    const projects = getStoredProjects();
    const users = getStoredUsers();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = { ...tasks[taskIndex] };
    
    // Update basic fields
    if (data.name) updatedTask.name = data.name;
    if (data.description !== undefined) updatedTask.description = data.description;
    if (data.priority) updatedTask.priority = data.priority as any;
    if (data.activityType) updatedTask.activityType = data.activityType as any;
    if (data.startDate) updatedTask.startDate = data.startDate;
    if (data.dueDate) updatedTask.dueDate = data.dueDate;
    if (data.plannedHours) updatedTask.plannedHours = data.plannedHours;
    
    // Update project and activity if changed
    if (data.projectId && data.activityId) {
      const project = projects.find(p => p.id === data.projectId);
      const activity = project?.activities.find(a => a.id === data.activityId);
      
      if (project && activity) {
        updatedTask.project = {
          id: project.id,
          code: project.code,
          name: project.name,
        };
        updatedTask.activity = {
          id: activity.id,
          name: activity.name,
        };
      }
    }
    
    // Update assigned users
    if (data.assignedToId) {
      const assignedTo = users.find(u => u.id === data.assignedToId);
      if (assignedTo) {
        updatedTask.assignedTo = {
          id: assignedTo.id,
          name: assignedTo.name,
          email: assignedTo.email,
          avatar: assignedTo.avatar,
        };
      }
    }
    
    if (data.taskReviewerId) {
      const taskReviewer = users.find(u => u.id === data.taskReviewerId);
      if (taskReviewer) {
        updatedTask.taskReviewer = {
          id: taskReviewer.id,
          name: taskReviewer.name,
          email: taskReviewer.email,
          avatar: taskReviewer.avatar,
        };
      }
    }
    
    updatedTask.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    tasks[taskIndex] = updatedTask;
    saveTasks(tasks);
    return updatedTask;
  },

  // Update task status
  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    await delay(300);
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    tasks[taskIndex].status = status;
    tasks[taskIndex].lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    saveTasks(tasks);
    return tasks[taskIndex];
  },

  // Delete task
  async deleteTask(id: string): Promise<void> {
    await delay(300);
    const tasks = getStoredTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    saveTasks(filteredTasks);
  },

  // Get all projects with activities
  async getProjects(): Promise<TaskProject[]> {
    await delay(200);
    return getStoredProjects();
  },

  // Search projects
  async searchProjects(query: string): Promise<TaskProject[]> {
    await delay(300);
    const projects = getStoredProjects();
    return projects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.code.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get all users
  async getUsers(): Promise<TaskUser[]> {
    await delay(200);
    return getStoredUsers();
  },

  // Search users
  async searchUsers(query: string): Promise<TaskUser[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Add activity (shared with projects)
  async addActivity(data: { name: string; description: string; projectId: string }): Promise<void> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(p => p.id === data.projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const newActivity = {
      id: Date.now().toString(),
      name: data.name,
      projectId: data.projectId,
      projectName: projects[projectIndex].name,
    };
    
    projects[projectIndex].activities.push(newActivity);
    saveProjects(projects);
  },

  // Update activity
  async updateActivity(projectId: string, activityId: string, data: { name: string; description?: string }): Promise<void> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    const activityIndex = projects[projectIndex].activities.findIndex(a => a.id === activityId);
    if (activityIndex === -1) {
      throw new Error('Activity not found');
    }
    
    projects[projectIndex].activities[activityIndex].name = data.name;
    saveProjects(projects);
  },

  // Delete activity
  async deleteActivity(projectId: string, activityId: string): Promise<void> {
    await delay(400);
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    projects[projectIndex].activities = projects[projectIndex].activities.filter(a => a.id !== activityId);
    saveProjects(projects);
  },

  // Get tasks by project
  async getTasksByProject(projectId: string): Promise<Task[]> {
    await delay(300);
    const tasks = getStoredTasks();
    return tasks.filter(task => task.project.id === projectId);
  },

  // Get tasks by user
  async getTasksByUser(userId: string): Promise<Task[]> {
    await delay(300);
    const tasks = getStoredTasks();
    return tasks.filter(task => task.assignedTo.id === userId);
  },

  // Get tasks by status
  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    await delay(300);
    const tasks = getStoredTasks();
    return tasks.filter(task => task.status === status);
  },

  // Get tasks by priority
  async getTasksByPriority(priority: Task['priority']): Promise<Task[]> {
    await delay(300);
    const tasks = getStoredTasks();
    return tasks.filter(task => task.priority === priority);
  },

  // Add comment to task
  async addComment(taskId: string, comment: string): Promise<Task> {
    await delay(300);
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    tasks[taskIndex].comments = comment;
    tasks[taskIndex].lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 16);
    saveTasks(tasks);
    return tasks[taskIndex];
  },
};