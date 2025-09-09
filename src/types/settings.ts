export interface GeneralSettings {
  dailyWorkingHours: number;
  weeklyWorkingDays: string[];
}

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  id: string;
  name: string;
  userCount: number;
  permissions: {
    timesheet: Permission;
    task: Permission;
    project: Permission;
    client: Permission;
    report: Permission;
  };
}

export interface SettingsFormData {
  dailyWorkingHours: number;
  weeklyWorkingDays: string[];
}

export interface RoleFormData {
  name: string;
  permissions: {
    timesheet: Permission;
    task: Permission;
    project: Permission;
    client: Permission;
    report: Permission;
  };
}