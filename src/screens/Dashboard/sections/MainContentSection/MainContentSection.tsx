import {
  ArrowRightIcon,
  BarChart3Icon,
  BriefcaseIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  UsersIcon,
  UserCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { clientApi } from "../../../../services/clientApi";
import { projectApi } from "../../../../services/projectApi";
import { taskApi } from "../../../../services/taskApi";
import { userApi } from "../../../../services/userApi";
import { Client } from "../../../../types/client";
import { Project } from "../../../../types/project";
import { Task } from "../../../../types/task";
import { User } from "../../../../types/user";
import { timesheetApi } from "../../../../services/timesheetApi";

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('This month');

  // Load all data
  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [clientsData, projectsData, tasksData, usersData, timesheetsData] = await Promise.all([
          clientApi.getClients(),
          projectApi.getProjects(),
          taskApi.getTasks(),
          userApi.getUsers(),
          timesheetApi.getTimesheets(),
        ]);
        
        setClients(clientsData);
        setProjects(projectsData);
        setTasks(tasksData);
        setUsers(usersData);
        setTimesheets(timesheetsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate main stats
  const mainStats = useMemo(() => {
    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
    const timesheetsNotSubmitted = timesheets.filter(t => t.status === 'Pending').length;
    const pendingApprovals = timesheets.filter(t => t.status === 'Pending').length;
    const totalLoggedHours = users.reduce((sum, user) => sum + user.totalLoggedHours, 0);

    return [
      {
        value: overdueTasks,
        label: "Task overdue",
        change: "+7%",
        trend: "up",
        icon: <CheckSquareIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        value: timesheetsNotSubmitted,
        label: "Timesheets not submitted ontime",
        change: "+15%",
        trend: "up",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        value: pendingApprovals,
        label: "Timesheets pending for approval",
        change: "+37%",
        trend: "up",
        icon: <CheckCircleIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        value: totalLoggedHours,
        label: "Total hour logged",
        change: "+31%",
        trend: "up",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
    ];
  }, [tasks, timesheets, users]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const projectStats = {
      active: projects.filter(p => p.status === 'Active').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      inactive: projects.filter(p => p.status === 'Inactive').length,
      onHold: projects.filter(p => p.status === 'On Hold').length,
      total: projects.length,
    };

    const userStats = {
      active: users.filter(u => u.status === 'Active').length,
      inactive: users.filter(u => u.status === 'Inactive').length,
      total: users.length,
    };

    const clientStats = {
      active: clients.filter(c => c.status === 'Active').length,
      inactive: clients.filter(c => c.status === 'Inactive').length,
      total: clients.length,
    };

    const loggedHoursStats = {
      billable: 456,
      nonBillable: 121,
      total: 577,
    };

    return {
      projects: projectStats,
      users: userStats,
      clients: clientStats,
      loggedHours: loggedHoursStats,
    };
  }, [projects, users, clients]);

  // Important alerts
  const importantAlerts = useMemo(() => {
    const alerts = [];
    
    // Project without task
    const projectsWithoutTasks = projects.filter(p => 
      p.status === 'Active' && tasks.filter(t => t.project.id === p.id).length === 0
    );
    if (projectsWithoutTasks.length > 0) {
      alerts.push({
        id: '1',
        type: 'warning',
        title: `Project without task → ${projectsWithoutTasks[0].code}`,
        time: '10 min ago',
        onClick: () => navigate(`/projects/${projectsWithoutTasks[0].id}`),
      });
    }

    // Task missed deadline
    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    );
    if (overdueTasks.length > 0) {
      alerts.push({
        id: '2',
        type: 'warning',
        title: `2 task missed deadline → ${overdueTasks[0].code}, ${overdueTasks[1]?.code || 'TSK-43564'}`,
        time: '14 July 2025',
        onClick: () => navigate(`/tasks/${overdueTasks[0].id}`),
      });
    }

    // User not assigned in Task
    const unassignedTasks = tasks.filter(t => t.status === 'To Do');
    if (unassignedTasks.length > 0) {
      alerts.push({
        id: '3',
        type: 'warning',
        title: `User not assigned in Task → ${unassignedTasks[0].code}`,
        time: '1 hour ago',
        onClick: () => navigate(`/tasks/${unassignedTasks[0].id}`),
      });
    }

    // Task overdue
    if (overdueTasks.length > 0) {
      alerts.push({
        id: '4',
        type: 'error',
        title: `Task "${overdueTasks[0].name}" is overdue`,
        time: '2 hour ago',
        onClick: () => navigate(`/tasks/${overdueTasks[0].id}`),
      });
    }

    // Timesheet pending
    const pendingTimesheets = timesheets.filter(t => t.status === 'Pending');
    if (pendingTimesheets.length > 0) {
      alerts.push({
        id: '5',
        type: 'warning',
        title: `Timesheet for ${pendingTimesheets[0].userName} is pending for approval.`,
        time: '2 days ago',
        onClick: () => navigate(`/timesheet/${pendingTimesheets[0].userId}`),
      });
    }

    // Project completed
    const completedProjects = projects.filter(p => p.status === 'Completed');
    if (completedProjects.length > 0) {
      alerts.push({
        id: '6',
        type: 'success',
        title: `"Alpha One" Project completed on time.`,
        time: '2 days ago',
        onClick: () => navigate(`/projects/${completedProjects[0].id}`),
      });
    }

    return alerts.slice(0, 6);
  }, [projects, tasks, timesheets, navigate]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#8b5cf6" }: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}</div>
            <div className="text-xs text-gray-500">Total projects</div>
          </div>
        </div>
      </div>
    );
  };

  const DonutChart = ({ data, size = 120, strokeWidth = 20 }: {
    data: { value: number; color: string; label: string }[];
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    let cumulativePercentage = 0;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;
            const rotation = (cumulativePercentage / 100) * 360;
            
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                  transform: `rotate(${rotation}deg)`,
                }}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total {data[0]?.label.split(' ')[1] || 'items'}</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Dashboard
        </h1>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="This month">This month</SelectItem>
            <SelectItem value="Last month">Last month</SelectItem>
            <SelectItem value="This quarter">This quarter</SelectItem>
            <SelectItem value="This year">This year</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {mainStats.map((stat, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className={`font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Charts Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects Chart */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    23%
                  </div>
                  <CircularProgress 
                    percentage={23} 
                    size={100} 
                    color="#8b5cf6"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{chartData.projects.active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium">{chartData.projects.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-200"></div>
                    <span className="text-gray-600">Inactive</span>
                    <span className="font-medium">{chartData.projects.inactive}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-gray-600">Hold</span>
                    <span className="font-medium">{chartData.projects.onHold}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Chart */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/users')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    75%
                  </div>
                  <DonutChart 
                    data={[
                      { value: chartData.users.active, color: "#10b981", label: "Active users" },
                      { value: chartData.users.inactive, color: "#6b7280", label: "Inactive users" },
                    ]}
                    size={100}
                    strokeWidth={20}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{chartData.users.active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-gray-600">Non-active</span>
                    <span className="font-medium">{chartData.users.inactive}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients Chart */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/clients')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded">
                    79%
                  </div>
                  <DonutChart 
                    data={[
                      { value: chartData.clients.active, color: "#0d9488", label: "Active clients" },
                      { value: chartData.clients.inactive, color: "#14b8a6", label: "Inactive clients" },
                    ]}
                    size={100}
                    strokeWidth={20}
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{chartData.clients.active}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                    <span className="text-gray-600">Inactive</span>
                    <span className="font-medium">{chartData.clients.inactive}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Total client: {chartData.clients.total}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logged Hours Chart */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Logged hours</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/timesheet')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{chartData.loggedHours.billable}</div>
                  <div className="text-sm text-gray-600">Billable hours</div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-2xl font-bold text-blue-600">VS</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{chartData.loggedHours.nonBillable}</div>
                  <div className="text-sm text-gray-600">Non-billable hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Alerts */}
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Important alerts</h3>
            </div>
            
            <div className="space-y-4">
              {importantAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={alert.onClick}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.time}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              ))}
              
              {importantAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No alerts at the moment</p>
                </div>
              )}
              
              {importantAlerts.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                  >
                    Next →
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};