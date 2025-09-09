import { TimesheetReport, UserReport, ClientReport, ProjectReport, TaskReport } from '../types/reports';
import { mockUsers } from './mockUsers';
import { mockClients } from './mockClients';
import { mockProjects } from './mockProjects';
import { mockTasks } from './mockTasks';
import { mockTimesheets } from './mockTimesheets';

// Generate timesheet reports from existing timesheet data
export const mockTimesheetReports: TimesheetReport[] = mockTimesheets.map(timesheet => ({
  id: timesheet.id,
  userName: timesheet.userName,
  userAvatar: timesheet.userAvatar,
  approverName: timesheet.approverName,
  approverAvatar: timesheet.approverAvatar,
  department: timesheet.department,
  dateRange: `16 June 2025 - 11 July 2025`,
  status: timesheet.status === 'Pending' ? 'Pending for approval' : timesheet.status,
  totalHours: timesheet.totalHours,
  submittedDate: timesheet.submittedDate,
}));

// Generate user reports from existing user data
export const mockUserReports: UserReport[] = mockUsers.slice(0, 50).map(user => ({
  id: user.id,
  userCode: user.code,
  userName: `${user.firstName} ${user.lastName}`,
  userAvatar: user.avatar,
  email: user.email,
  role: user.role,
  department: user.department,
  reportingManager: user.reportingManager.name,
  reportingManagerAvatar: user.reportingManager.avatar,
  status: user.status,
  totalLoggedHours: user.totalLoggedHours,
  projectsAssigned: user.assignedProjects.length,
}));

// Generate client reports from existing client data
export const mockClientReports: ClientReport[] = mockClients.slice(0, 30).map(client => ({
  id: client.id,
  clientCode: client.code,
  clientName: client.name,
  email: client.email,
  country: client.country,
  industry: client.industry,
  projects: client.projects,
  accountManager: client.manager.name,
  accountManagerAvatar: client.manager.avatar,
  status: client.status,
  onboardingDate: client.onboardingDate,
  totalRevenue: Math.floor(Math.random() * 1000000) + 100000,
}));

// Generate project reports from existing project data
export const mockProjectReports: ProjectReport[] = mockProjects.slice(0, 40).map(project => ({
  id: project.id,
  projectCode: project.code,
  projectName: project.name,
  clientName: project.client.name,
  type: project.type,
  startDate: project.startDate,
  endDate: project.endDate,
  projectManager: project.projectManager.name,
  projectManagerAvatar: project.projectManager.avatar,
  status: project.status,
  totalHours: Math.floor(Math.random() * 1000) + 100,
  teamSize: project.assignedTeam.length,
}));

// Generate task reports from existing task data
export const mockTaskReports: TaskReport[] = mockTasks.slice(0, 60).map(task => ({
  id: task.id,
  taskCode: task.code,
  taskName: task.name,
  projectName: task.project.name,
  activity: task.activity.name,
  assignedTo: task.assignedTo.name,
  assignedToAvatar: task.assignedTo.avatar,
  priority: task.priority,
  status: task.status === 'In Progress' ? 'In progress' : task.status,
  dueDate: task.dueDate,
  hoursLogged: Math.floor(Math.random() * 40) + 5,
}));

export const dateRangeOptions = [
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'yearToDate', label: 'Year till date' },
  { value: 'custom', label: 'Custom date range' },
];