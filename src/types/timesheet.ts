export interface TimesheetEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  approverId: string;
  approverName: string;
  approverAvatar: string;
  department: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  totalHours: number;
  entries: TimesheetDayEntry[];
  activityLog: TimesheetActivity[];
}

export interface TimesheetDayEntry {
  id: string;
  date: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  activityId: string;
  activityName: string;
  taskId: string;
  taskName: string;
  hours: number;
  billable: boolean;
  description?: string;
}

export interface TimesheetActivity {
  id: string;
  type: 'submitted' | 'approved' | 'rejected' | 'updated';
  performedBy: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  comment?: string;
}

export interface TimesheetFormData {
  userId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  entries: Omit<TimesheetDayEntry, 'id'>[];
}

export interface TimesheetApprovalData {
  timesheetIds: string[];
  action: 'approve' | 'reject';
  comment?: string;
}

export interface TimesheetStats {
  totalEntries: number;
  approved: number;
  pending: number;
  rejected: number;
}