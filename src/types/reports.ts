export interface ReportFilter {
  dateRange: 'last7days' | 'thisMonth' | 'lastMonth' | 'yearToDate' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export interface TimesheetReport {
  id: string;
  userName: string;
  userAvatar: string;
  approverName: string;
  approverAvatar: string;
  department: string;
  dateRange: string;
  status: 'Approved' | 'Pending for approval' | 'Rejected';
  totalHours: number;
  submittedDate: string;
}

export interface UserReport {
  id: string;
  userCode: string;
  userName: string;
  userAvatar: string;
  email: string;
  role: string;
  department: string;
  reportingManager: string;
  reportingManagerAvatar: string;
  status: 'Active' | 'Inactive';
  totalLoggedHours: number;
  projectsAssigned: number;
}

export interface ClientReport {
  id: string;
  clientCode: string;
  clientName: string;
  email: string;
  country: string;
  industry: string;
  projects: number;
  accountManager: string;
  accountManagerAvatar: string;
  status: 'Active' | 'Inactive';
  onboardingDate: string;
  totalRevenue: number;
}

export interface ProjectReport {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  type: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  projectManagerAvatar: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'On Hold';
  totalHours: number;
  teamSize: number;
}

export interface TaskReport {
  id: string;
  taskCode: string;
  taskName: string;
  projectName: string;
  activity: string;
  assignedTo: string;
  assignedToAvatar: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To Do' | 'In progress' | 'Completed' | 'On Hold';
  dueDate: string;
  hoursLogged: number;
}

export interface ReportStats {
  totalRecords: number;
  activeRecords: number;
  inactiveRecords: number;
  completedRecords?: number;
  pendingRecords?: number;
}