import { GeneralSettings, RolePermissions } from '../types/settings';

export const mockGeneralSettings: GeneralSettings = {
  dailyWorkingHours: 8,
  weeklyWorkingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export const mockRoles: RolePermissions[] = [
  {
    id: '1',
    name: 'Project Manager',
    userCount: 37,
    permissions: {
      timesheet: { view: true, create: true, edit: false, delete: false },
      task: { view: true, create: true, edit: true, delete: false },
      project: { view: false, create: false, edit: false, delete: false },
      client: { view: false, create: false, edit: false, delete: false },
      report: { view: true, create: true, edit: false, delete: false },
    },
  },
  {
    id: '2',
    name: 'Employee',
    userCount: 97,
    permissions: {
      timesheet: { view: true, create: true, edit: true, delete: false },
      task: { view: true, create: false, edit: false, delete: false },
      project: { view: true, create: false, edit: false, delete: false },
      client: { view: false, create: false, edit: false, delete: false },
      report: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: '3',
    name: 'HR',
    userCount: 3,
    permissions: {
      timesheet: { view: true, create: false, edit: false, delete: false },
      task: { view: false, create: false, edit: false, delete: false },
      project: { view: false, create: false, edit: false, delete: false },
      client: { view: false, create: false, edit: false, delete: false },
      report: { view: true, create: true, edit: true, delete: false },
    },
  },
  {
    id: '4',
    name: 'Account & Finance',
    userCount: 5,
    permissions: {
      timesheet: { view: true, create: false, edit: false, delete: false },
      task: { view: false, create: false, edit: false, delete: false },
      project: { view: true, create: false, edit: false, delete: false },
      client: { view: true, create: true, edit: true, delete: false },
      report: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: '5',
    name: 'Account Manager',
    userCount: 15,
    permissions: {
      timesheet: { view: true, create: false, edit: false, delete: false },
      task: { view: true, create: true, edit: true, delete: false },
      project: { view: true, create: true, edit: true, delete: false },
      client: { view: true, create: true, edit: true, delete: false },
      report: { view: true, create: true, edit: false, delete: false },
    },
  },
];

export const weekDays = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const modules = [
  'timesheet',
  'task', 
  'project',
  'client',
  'report'
];

export const permissions = ['view', 'create', 'edit', 'delete'];