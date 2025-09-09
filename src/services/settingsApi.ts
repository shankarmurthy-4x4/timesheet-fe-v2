import { GeneralSettings, RolePermissions, SettingsFormData, RoleFormData } from '../types/settings';
import { mockGeneralSettings, mockRoles } from '../data/mockSettings';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const GENERAL_SETTINGS_KEY = 'generalSettings';
const ROLES_KEY = 'roles';

// Get settings from localStorage or use mock data
const getStoredSettings = (): GeneralSettings => {
  try {
    const stored = localStorage.getItem(GENERAL_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : mockGeneralSettings;
  } catch {
    return mockGeneralSettings;
  }
};

// Get roles from localStorage or use mock data
const getStoredRoles = (): RolePermissions[] => {
  try {
    const stored = localStorage.getItem(ROLES_KEY);
    return stored ? JSON.parse(stored) : mockRoles;
  } catch {
    return mockRoles;
  }
};

// Save settings to localStorage
const saveSettings = (settings: GeneralSettings): void => {
  try {
    localStorage.setItem(GENERAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Save roles to localStorage
const saveRoles = (roles: RolePermissions[]): void => {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  } catch (error) {
    console.error('Failed to save roles:', error);
  }
};

export const settingsApi = {
  // Get general settings
  async getGeneralSettings(): Promise<GeneralSettings> {
    await delay(200);
    return getStoredSettings();
  },

  // Update general settings
  async updateGeneralSettings(data: SettingsFormData): Promise<GeneralSettings> {
    await delay(300);
    const updatedSettings: GeneralSettings = {
      dailyWorkingHours: data.dailyWorkingHours,
      weeklyWorkingDays: data.weeklyWorkingDays,
    };
    saveSettings(updatedSettings);
    return updatedSettings;
  },

  // Get all roles
  async getRoles(): Promise<RolePermissions[]> {
    await delay(200);
    return getStoredRoles();
  },

  // Get role by ID
  async getRoleById(id: string): Promise<RolePermissions | null> {
    await delay(200);
    const roles = getStoredRoles();
    return roles.find(role => role.id === id) || null;
  },

  // Create new role
  async createRole(data: RoleFormData): Promise<RolePermissions> {
    await delay(400);
    const roles = getStoredRoles();
    
    const newRole: RolePermissions = {
      id: Date.now().toString(),
      name: data.name,
      userCount: 0,
      permissions: data.permissions,
    };
    
    const updatedRoles = [...roles, newRole];
    saveRoles(updatedRoles);
    return newRole;
  },

  // Update role
  async updateRole(id: string, data: RoleFormData): Promise<RolePermissions> {
    await delay(400);
    const roles = getStoredRoles();
    const roleIndex = roles.findIndex(role => role.id === id);
    
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    const updatedRole: RolePermissions = {
      ...roles[roleIndex],
      name: data.name,
      permissions: data.permissions,
    };
    
    roles[roleIndex] = updatedRole;
    saveRoles(roles);
    return updatedRole;
  },

  // Delete role
  async deleteRole(id: string): Promise<void> {
    await delay(300);
    const roles = getStoredRoles();
    const filteredRoles = roles.filter(role => role.id !== id);
    saveRoles(filteredRoles);
  },

  // Get users by role
  async getUsersByRole(roleId: string): Promise<number> {
    await delay(200);
    const roles = getStoredRoles();
    const role = roles.find(r => r.id === roleId);
    return role ? role.userCount : 0;
  },

  // Assign role to user
  async assignRoleToUser(roleId: string, userId: string): Promise<void> {
    await delay(300);
    const roles = getStoredRoles();
    const roleIndex = roles.findIndex(role => role.id === roleId);
    
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    // Increment user count for this role
    roles[roleIndex].userCount += 1;
    saveRoles(roles);
  },

  // Remove role from user
  async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    await delay(300);
    const roles = getStoredRoles();
    const roleIndex = roles.findIndex(role => role.id === roleId);
    
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }
    
    // Decrement user count for this role (ensure it doesn't go below 0)
    roles[roleIndex].userCount = Math.max(0, roles[roleIndex].userCount - 1);
    saveRoles(roles);
  },

  // Check if user has permission
  async checkPermission(
    userId: string, 
    module: string, 
    permission: 'view' | 'create' | 'edit' | 'delete'
  ): Promise<boolean> {
    await delay(100);
    // In a real implementation, this would check the user's assigned role
    // and then check if that role has the requested permission
    // For now, we'll just return true
    return true;
  },
};