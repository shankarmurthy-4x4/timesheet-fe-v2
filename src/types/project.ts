export interface Project {
  id: string;
  code: string;
  name: string;
  client: {
    id: string;
    code: string;
    name: string;
  };
  type: 'POC' | 'Development' | 'Maintenance' | 'Consulting';
  startDate: string;
  endDate: string;
  duration: string;
  billingType: 'Billable' | 'Non-Billable' | 'Internal';
  status: 'Active' | 'Inactive' | 'Completed' | 'On Hold';
  accountManager: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  projectManager: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  assignedTeam: TeamMember[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  assignedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  projectId: string;
  assignedTo?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  clientId: string;
  type: string;
  startDate: string;
  endDate: string;
  billingType: string;
  projectManagerId?: string;
}

export interface ActivityFormData {
  name: string;
  description: string;
  projectId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}