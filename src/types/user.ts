export interface User {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  reportingManager: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: 'Active' | 'Inactive';
  avatar: string;
  totalLoggedHours: number;
  assignedProjects: AssignedProject[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignedProject {
  id: string;
  code: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  type: string;
  billingType: string;
  startDate: string;
  endDate: string;
  assignedAt: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  reportingManagerId: string;
}

export interface AssignProjectFormData {
  projectIds: string[];
}