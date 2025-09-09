import { User, UserFormData, AssignProjectFormData } from '../types/user';
import { mockUsers } from '../data/mockUsers';
import { projectApi } from './projectApi';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key
const STORAGE_KEY = 'users';

// Get users from localStorage or use mock data
const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  } catch {
    return mockUsers;
  }
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

export const userApi = {
  // Get all users
  async getUsers(): Promise<User[]> {
    await delay(300);
    return getStoredUsers();
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    await delay(200);
    const users = getStoredUsers();
    return users.find(user => user.id === id) || null;
  },

  // Create new user
  async createUser(data: UserFormData): Promise<User> {
    await delay(500);
    const users = getStoredUsers();
    
    // Find reporting manager
    const reportingManager = users.find(u => u.id === data.reportingManagerId);
    
    const newUser: User = {
      id: Date.now().toString(),
      code: `EMP-${String(users.length + 10000).padStart(5, '0')}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      department: data.department,
      reportingManager: reportingManager ? {
        id: reportingManager.id,
        name: `${reportingManager.firstName} ${reportingManager.lastName}`,
        email: reportingManager.email,
        avatar: reportingManager.avatar,
      } : {
        id: '1',
        name: 'Unassigned',
        email: 'unassigned@company.com',
        avatar: '/rectangle-3-1.png',
      },
      status: 'Active',
      avatar: `/rectangle-3-${Math.floor(Math.random() * 10) + 1}.png`,
      totalLoggedHours: 0,
      assignedProjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return newUser;
  },

  // Update user
  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    await delay(400);
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Find reporting manager if changed
    let reportingManager = users[userIndex].reportingManager;
    if (data.reportingManagerId) {
      const manager = users.find(u => u.id === data.reportingManagerId);
      if (manager) {
        reportingManager = {
          id: manager.id,
          name: `${manager.firstName} ${manager.lastName}`,
          email: manager.email,
          avatar: manager.avatar,
        };
      }
    }
    
    const updatedUser = {
      ...users[userIndex],
      firstName: data.firstName || users[userIndex].firstName,
      lastName: data.lastName || users[userIndex].lastName,
      email: data.email || users[userIndex].email,
      role: data.role || users[userIndex].role,
      department: data.department || users[userIndex].department,
      reportingManager,
      updatedAt: new Date().toISOString(),
    };
    
    users[userIndex] = updatedUser;
    saveUsers(users);
    return updatedUser;
  },

  // Update user status
  async updateUserStatus(id: string, status: 'Active' | 'Inactive'): Promise<User> {
    await delay(300);
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].status = status;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);
    return users[userIndex];
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await delay(300);
    const users = getStoredUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    saveUsers(filteredUsers);
  },

  // Assign projects to user
  async assignProjects(userId: string, data: AssignProjectFormData): Promise<User> {
    await delay(400);
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Get project details
    const projects = await projectApi.getProjects();
    const newAssignedProjects = data.projectIds.map(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return null;
      
      return {
        id: project.id,
        code: project.code,
        name: project.name,
        client: project.client,
        type: project.type,
        billingType: project.billingType,
        startDate: project.startDate,
        endDate: project.endDate,
        assignedAt: new Date().toISOString(),
      };
    }).filter(Boolean);
    
    // Add new projects to existing ones (avoid duplicates)
    const existingProjectIds = users[userIndex].assignedProjects.map(p => p.id);
    const uniqueNewProjects = newAssignedProjects.filter(p => p && !existingProjectIds.includes(p.id));
    
    users[userIndex].assignedProjects = [...users[userIndex].assignedProjects, ...uniqueNewProjects];
    users[userIndex].updatedAt = new Date().toISOString();
    
    saveUsers(users);
    return users[userIndex];
  },

  // Remove project from user
  async removeProject(userId: string, projectId: string): Promise<User> {
    await delay(300);
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].assignedProjects = users[userIndex].assignedProjects.filter(
      project => project.id !== projectId
    );
    users[userIndex].updatedAt = new Date().toISOString();
    
    saveUsers(users);
    return users[userIndex];
  },

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => 
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.code.toLowerCase().includes(query.toLowerCase()) ||
      user.department.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => user.department === department);
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => user.role === role);
  },

  // Get users by status
  async getUsersByStatus(status: 'Active' | 'Inactive'): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => user.status === status);
  },

  // Get users by manager
  async getUsersByManager(managerId: string): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(user => user.reportingManager.id === managerId);
  },

  // Update user logged hours
  async updateUserLoggedHours(userId: string, hours: number): Promise<User> {
    await delay(300);
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].totalLoggedHours += hours;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);
    return users[userIndex];
  },
};