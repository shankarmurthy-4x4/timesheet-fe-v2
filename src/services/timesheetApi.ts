import { TimesheetEntry, TimesheetFormData, TimesheetApprovalData, TimesheetStats } from '../types/timesheet';
import { mockTimesheets } from '../data/mockTimesheets';
import { userApi } from './userApi';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key
const STORAGE_KEY = 'timesheets';

// Get timesheets from localStorage or use mock data
const getStoredTimesheets = (): TimesheetEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTimesheets;
  } catch {
    return mockTimesheets;
  }
};

// Save timesheets to localStorage
const saveTimesheets = (timesheets: TimesheetEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timesheets));
  } catch (error) {
    console.error('Failed to save timesheets:', error);
  }
};

export const timesheetApi = {
  // Get all timesheets
  async getTimesheets(): Promise<TimesheetEntry[]> {
    await delay(300);
    return getStoredTimesheets();
  },

  // Get timesheet by ID
  async getTimesheetById(id: string): Promise<TimesheetEntry | null> {
    await delay(200);
    const timesheets = getStoredTimesheets();
    return timesheets.find(timesheet => timesheet.id === id) || null;
  },

  // Get timesheets by user ID
  async getTimesheetsByUserId(userId: string): Promise<TimesheetEntry[]> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    return timesheets.filter(timesheet => timesheet.userId === userId);
  },

  // Get timesheet statistics
  async getTimesheetStats(): Promise<TimesheetStats> {
    await delay(200);
    const timesheets = getStoredTimesheets();
    
    return {
      totalEntries: timesheets.length,
      approved: timesheets.filter(t => t.status === 'Approved').length,
      pending: timesheets.filter(t => t.status === 'Pending').length,
      rejected: timesheets.filter(t => t.status === 'Rejected').length,
    };
  },

  // Create new timesheet
  async createTimesheet(data: TimesheetFormData): Promise<TimesheetEntry> {
    await delay(500);
    const timesheets = getStoredTimesheets();
    
    // Get user details
    const user = await userApi.getUserById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get approver (reporting manager)
    const approver = await userApi.getUserById(user.reportingManager.id);
    if (!approver) {
      throw new Error('Approver not found');
    }
    
    const newTimesheet: TimesheetEntry = {
      id: Date.now().toString(),
      userId: data.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
      approverId: approver.id,
      approverName: `${approver.firstName} ${approver.lastName}`,
      approverAvatar: approver.avatar,
      department: user.department,
      dateRange: data.dateRange,
      status: 'Pending',
      submittedDate: new Date().toISOString(),
      totalHours: data.entries.reduce((total, entry) => total + entry.hours, 0),
      entries: data.entries.map((entry, index) => ({
        ...entry,
        id: `${Date.now()}-${index}`,
      })),
      activityLog: [
        {
          id: `${Date.now()}-log-1`,
          type: 'submitted',
          performedBy: {
            id: data.userId,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
          },
          date: new Date().toISOString(),
        },
      ],
    };
    
    const updatedTimesheets = [...timesheets, newTimesheet];
    saveTimesheets(updatedTimesheets);
    
    // Update user's logged hours
    await userApi.updateUserLoggedHours(data.userId, newTimesheet.totalHours);
    
    return newTimesheet;
  },

  // Update timesheet
  async updateTimesheet(id: string, data: Partial<TimesheetFormData>): Promise<TimesheetEntry> {
    await delay(400);
    const timesheets = getStoredTimesheets();
    const timesheetIndex = timesheets.findIndex(timesheet => timesheet.id === id);
    
    if (timesheetIndex === -1) {
      throw new Error('Timesheet not found');
    }
    
    // Calculate previous total hours
    const previousTotalHours = timesheets[timesheetIndex].totalHours;
    
    // Calculate new total hours if entries are updated
    let newTotalHours = previousTotalHours;
    if (data.entries) {
      newTotalHours = data.entries.reduce((total, entry) => total + entry.hours, 0);
    }
    
    const updatedTimesheet = {
      ...timesheets[timesheetIndex],
      dateRange: data.dateRange || timesheets[timesheetIndex].dateRange,
      entries: data.entries ? data.entries.map((entry, index) => ({
        ...entry,
        id: entry.id || `${Date.now()}-${index}`,
      })) : timesheets[timesheetIndex].entries,
      totalHours: newTotalHours,
      activityLog: [
        ...timesheets[timesheetIndex].activityLog,
        {
          id: `${Date.now()}-log-update`,
          type: 'updated',
          performedBy: {
            id: timesheets[timesheetIndex].userId,
            name: timesheets[timesheetIndex].userName,
            email: 'user@company.com', // This would come from the current user context
            avatar: timesheets[timesheetIndex].userAvatar,
          },
          date: new Date().toISOString(),
        },
      ],
    };
    
    timesheets[timesheetIndex] = updatedTimesheet;
    saveTimesheets(timesheets);
    
    // Update user's logged hours (only the difference)
    if (newTotalHours !== previousTotalHours) {
      await userApi.updateUserLoggedHours(
        timesheets[timesheetIndex].userId, 
        newTotalHours - previousTotalHours
      );
    }
    
    return updatedTimesheet;
  },

  // Approve or reject timesheets
  async updateTimesheetStatus(data: TimesheetApprovalData): Promise<TimesheetEntry[]> {
    await delay(400);
    const timesheets = getStoredTimesheets();
    const updatedTimesheets: TimesheetEntry[] = [];
    
    data.timesheetIds.forEach(timesheetId => {
      const timesheetIndex = timesheets.findIndex(t => t.id === timesheetId);
      if (timesheetIndex !== -1) {
        const timesheet = timesheets[timesheetIndex];
        const newStatus = data.action === 'approve' ? 'Approved' : 'Rejected';
        const currentDate = new Date().toISOString();
        
        const updatedTimesheet = {
          ...timesheet,
          status: newStatus as 'Approved' | 'Rejected',
          ...(data.action === 'approve' ? { approvedDate: currentDate } : { rejectedDate: currentDate }),
          activityLog: [
            ...timesheet.activityLog,
            {
              id: `${Date.now()}-${timesheetId}`,
              type: data.action === 'approve' ? 'approved' : 'rejected' as 'approved' | 'rejected',
              performedBy: {
                id: timesheet.approverId,
                name: timesheet.approverName,
                email: 'approver@company.com', // This would come from the current user context
                avatar: timesheet.approverAvatar,
              },
              date: currentDate,
              comment: data.comment,
            },
          ],
        };
        
        timesheets[timesheetIndex] = updatedTimesheet;
        updatedTimesheets.push(updatedTimesheet);
      }
    });
    
    saveTimesheets(timesheets);
    return updatedTimesheets;
  },

  // Delete timesheet
  async deleteTimesheet(id: string): Promise<void> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    const timesheet = timesheets.find(t => t.id === id);
    
    if (timesheet) {
      // Update user's logged hours (subtract the deleted timesheet hours)
      await userApi.updateUserLoggedHours(timesheet.userId, -timesheet.totalHours);
    }
    
    const filteredTimesheets = timesheets.filter(timesheet => timesheet.id !== id);
    saveTimesheets(filteredTimesheets);
  },

  // Search timesheets
  async searchTimesheets(query: string): Promise<TimesheetEntry[]> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    return timesheets.filter(timesheet => 
      timesheet.userName.toLowerCase().includes(query.toLowerCase()) ||
      timesheet.approverName.toLowerCase().includes(query.toLowerCase()) ||
      timesheet.department.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get timesheets by status
  async getTimesheetsByStatus(status: 'Pending' | 'Approved' | 'Rejected'): Promise<TimesheetEntry[]> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    return timesheets.filter(timesheet => timesheet.status === status);
  },

  // Get timesheets by date range
  async getTimesheetsByDateRange(startDate: string, endDate: string): Promise<TimesheetEntry[]> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    return timesheets.filter(timesheet => {
      const timesheetStart = new Date(timesheet.dateRange.startDate);
      const timesheetEnd = new Date(timesheet.dateRange.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      // Check if timesheet date range overlaps with the specified date range
      return (timesheetStart <= rangeEnd && timesheetEnd >= rangeStart);
    });
  },

  // Get timesheets by department
  async getTimesheetsByDepartment(department: string): Promise<TimesheetEntry[]> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    return timesheets.filter(timesheet => timesheet.department === department);
  },

  // Update timesheet entry
  async updateTimesheetEntry(
    timesheetId: string, 
    entryId: string, 
    updates: { hours?: number; billable?: boolean; description?: string }
  ): Promise<TimesheetEntry> {
    await delay(300);
    const timesheets = getStoredTimesheets();
    const timesheetIndex = timesheets.findIndex(t => t.id === timesheetId);
    
    if (timesheetIndex === -1) {
      throw new Error('Timesheet not found');
    }
    
    const timesheet = timesheets[timesheetIndex];
    const entryIndex = timesheet.entries.findIndex(e => e.id === entryId);
    
    if (entryIndex === -1) {
      throw new Error('Entry not found');
    }
    
    // Calculate previous total hours
    const previousTotalHours = timesheet.totalHours;
    const previousEntryHours = timesheet.entries[entryIndex].hours;
    
    // Update the entry
    timesheet.entries[entryIndex] = {
      ...timesheet.entries[entryIndex],
      ...updates,
    };
    
    // Recalculate total hours
    const newTotalHours = timesheet.entries.reduce((total, entry) => total + entry.hours, 0);
    timesheet.totalHours = newTotalHours;
    
    // Add activity log entry
    timesheet.activityLog.push({
      id: `${Date.now()}-entry-update`,
      type: 'updated',
      performedBy: {
        id: timesheet.userId,
        name: timesheet.userName,
        email: 'user@company.com', // This would come from the current user context
        avatar: timesheet.userAvatar,
      },
      date: new Date().toISOString(),
    });
    
    timesheets[timesheetIndex] = timesheet;
    saveTimesheets(timesheets);
    
    // Update user's logged hours (only the difference)
    if (updates.hours && updates.hours !== previousEntryHours) {
      await userApi.updateUserLoggedHours(
        timesheet.userId, 
        updates.hours - previousEntryHours
      );
    }
    
    return timesheet;
  },
};