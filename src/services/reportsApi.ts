import { 
  TimesheetReport, 
  UserReport, 
  ClientReport, 
  ProjectReport, 
  TaskReport, 
  ReportStats,
  ReportFilter 
} from '../types/reports';
import { 
  mockTimesheetReports, 
  mockUserReports, 
  mockClientReports, 
  mockProjectReports, 
  mockTaskReports 
} from '../data/mockReports';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const TIMESHEET_REPORTS_KEY = 'timesheetReports';
const USER_REPORTS_KEY = 'userReports';
const CLIENT_REPORTS_KEY = 'clientReports';
const PROJECT_REPORTS_KEY = 'projectReports';
const TASK_REPORTS_KEY = 'taskReports';

// Get reports from localStorage or use mock data
const getStoredReports = <T>(key: string, mockData: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : mockData;
  } catch {
    return mockData;
  }
};

// Save reports to localStorage
const saveReports = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

// Filter reports by date range
const filterByDateRange = <T extends { [key: string]: any }>(
  reports: T[],
  filter: ReportFilter,
  dateField: string = 'date'
): T[] => {
  if (!filter.dateRange || filter.dateRange === 'all') {
    return reports;
  }
  
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);
  
  switch (filter.dateRange) {
    case 'last7days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'yearToDate':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (filter.customStartDate && filter.customEndDate) {
        startDate = new Date(filter.customStartDate);
        endDate = new Date(filter.customEndDate);
      } else {
        return reports;
      }
      break;
    default:
      return reports;
  }
  
  return reports.filter(report => {
    // Handle different date field formats
    let reportDate: Date;
    
    if (typeof report[dateField] === 'string') {
      reportDate = new Date(report[dateField]);
    } else if (report[dateField] && typeof report[dateField].startDate === 'string') {
      // For objects with startDate field
      reportDate = new Date(report[dateField].startDate);
    } else if (report.submittedDate) {
      // Fallback to submittedDate if available
      reportDate = new Date(report.submittedDate);
    } else if (report.createdAt) {
      // Fallback to createdAt if available
      reportDate = new Date(report.createdAt);
    } else {
      // If no valid date field is found, include the report
      return true;
    }
    
    return reportDate >= startDate && reportDate <= endDate;
  });
};

export const reportsApi = {
  // Timesheet Reports
  async getTimesheetReports(filter?: ReportFilter): Promise<TimesheetReport[]> {
    await delay(300);
    const reports = getStoredReports(TIMESHEET_REPORTS_KEY, mockTimesheetReports);
    
    if (!filter) {
      return reports;
    }
    
    return filterByDateRange(reports, filter, 'submittedDate');
  },

  async getTimesheetStats(): Promise<ReportStats> {
    await delay(200);
    const reports = getStoredReports(TIMESHEET_REPORTS_KEY, mockTimesheetReports);
    
    return {
      totalRecords: reports.length,
      activeRecords: reports.filter(t => t.status === 'Approved').length,
      inactiveRecords: reports.filter(t => t.status === 'Rejected').length,
      pendingRecords: reports.filter(t => t.status === 'Pending for approval').length,
    };
  },

  // User Reports
  async getUserReports(filter?: ReportFilter): Promise<UserReport[]> {
    await delay(300);
    const reports = getStoredReports(USER_REPORTS_KEY, mockUserReports);
    
    if (!filter) {
      return reports;
    }
    
    // For users, we don't have a specific date field to filter on
    // So we'll just return all reports for now
    return reports;
  },

  async getUserStats(): Promise<ReportStats> {
    await delay(200);
    const reports = getStoredReports(USER_REPORTS_KEY, mockUserReports);
    
    return {
      totalRecords: reports.length,
      activeRecords: reports.filter(u => u.status === 'Active').length,
      inactiveRecords: reports.filter(u => u.status === 'Inactive').length,
    };
  },

  // Client Reports
  async getClientReports(filter?: ReportFilter): Promise<ClientReport[]> {
    await delay(300);
    // Ensure we're returning the mock data if nothing is in localStorage
    let reports = getStoredReports(CLIENT_REPORTS_KEY, mockClientReports);
    
    // If reports array is empty, use mock data
    if (reports.length === 0) {
      reports = mockClientReports;
      // Save mock data to localStorage for future use
      saveReports(CLIENT_REPORTS_KEY, mockClientReports);
    }
    
    if (!filter) {
      return reports;
    }
    
    return filterByDateRange(reports, filter, 'onboardingDate');
  },

  async getClientStats(): Promise<ReportStats> {
    await delay(200);
    const reports = getStoredReports(CLIENT_REPORTS_KEY, mockClientReports);
    
    return {
      totalRecords: reports.length,
      activeRecords: reports.filter(c => c.status === 'Active').length,
      inactiveRecords: reports.filter(c => c.status === 'Inactive').length,
    };
  },

  // Project Reports
  async getProjectReports(filter?: ReportFilter): Promise<ProjectReport[]> {
    await delay(300);
    const reports = getStoredReports(PROJECT_REPORTS_KEY, mockProjectReports);
    
    if (!filter) {
      return reports;
    }
    
    return filterByDateRange(reports, filter, 'startDate');
  },

  async getProjectStats(): Promise<ReportStats> {
    await delay(200);
    const reports = getStoredReports(PROJECT_REPORTS_KEY, mockProjectReports);
    
    return {
      totalRecords: reports.length,
      activeRecords: reports.filter(p => p.status === 'Active').length,
      inactiveRecords: reports.filter(p => p.status === 'Inactive').length,
      completedRecords: reports.filter(p => p.status === 'Completed').length,
    };
  },

  // Task Reports
  async getTaskReports(filter?: ReportFilter): Promise<TaskReport[]> {
    await delay(300);
    const reports = getStoredReports(TASK_REPORTS_KEY, mockTaskReports);
    
    if (!filter) {
      return reports;
    }
    
    return filterByDateRange(reports, filter, 'dueDate');
  },

  async getTaskStats(): Promise<ReportStats> {
    await delay(200);
    const reports = getStoredReports(TASK_REPORTS_KEY, mockTaskReports);
    
    return {
      totalRecords: reports.length,
      activeRecords: reports.filter(t => t.status === 'In progress').length,
      inactiveRecords: reports.filter(t => t.status === 'On Hold').length,
      completedRecords: reports.filter(t => t.status === 'Completed').length,
      pendingRecords: reports.filter(t => t.status === 'To Do').length,
    };
  },

  // Export functionality
  async exportReport(reportType: string, format: 'csv' | 'excel' | 'pdf', filter?: ReportFilter): Promise<string> {
    await delay(1000);
    
    // This would generate and return a download URL in a real implementation
    // For now, we'll just return a mock URL
    return `https://api.example.com/reports/${reportType}/export?format=${format}&timestamp=${Date.now()}`;
  },

  // Generate custom report
  async generateCustomReport(
    reportType: string,
    fields: string[],
    filters: Record<string, any>,
    dateRange?: { from: string; to: string }
  ): Promise<string> {
    await delay(1500);
    
    // This would generate a custom report based on the specified parameters
    // For now, we'll just return a mock URL
    return `https://api.example.com/reports/custom/${reportType}?timestamp=${Date.now()}`;
  },

  // Schedule report
  async scheduleReport(
    reportType: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
    format: 'csv' | 'excel' | 'pdf',
    filters?: Record<string, any>
  ): Promise<{ id: string; message: string }> {
    await delay(800);
    
    // This would schedule a report to be generated and sent automatically
    return {
      id: `schedule-${Date.now()}`,
      message: `Report scheduled successfully. It will be sent ${schedule} to ${recipients.length} recipient(s).`,
    };
  },
};