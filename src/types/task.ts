export interface Task {
  id: string;
  code: string;
  name: string;
  description: string;
  project: {
    id: string;
    code: string;
    name: string;
  };
  activity: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  assignedBy: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  taskReviewer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To Do' | 'In Progress' | 'Completed' | 'On Hold';
  activityType: 'Feature' | 'Bug' | 'Enhancement' | 'Research' | 'Documentation';
  startDate: string;
  dueDate: string;
  createdDate: string;
  lastUpdated: string;
  frequency: string;
  plannedHours: string;
  comments?: string;
}

export interface TaskFormData {
  name: string;
  description?: string;
  projectId: string;
  activityId: string;
  assignedToId: string;
  taskReviewerId: string;
  priority: string;
  activityType: string;
  startDate: string;
  dueDate: string;
  plannedHours: string;
}

export interface TaskActivity {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
}

export interface TaskProject {
  id: string;
  code: string;
  name: string;
  activities: TaskActivity[];
}

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}