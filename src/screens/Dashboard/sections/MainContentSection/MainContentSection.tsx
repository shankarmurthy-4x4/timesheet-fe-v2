import {
  ArrowRightIcon,
  BarChart3Icon,
  BriefcaseIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  UsersIcon,
  UserCircleIcon,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
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

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    return [
      {
        title: "Total Clients",
        value: clients.length.toString(),
        change: "+12%",
        trend: "up",
        icon: <UserCircleIcon className="h-6 w-6" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        onClick: () => navigate('/clients'),
      },
      {
        title: "Active Projects",
        value: projects.filter(p => p.status === 'Active').length.toString(),
        change: "+8%",
        trend: "up",
        icon: <BriefcaseIcon className="h-6 w-6" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        onClick: () => navigate('/projects'),
      },
      {
        title: "Pending Tasks",
        value: tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length.toString(),
        change: "-5%",
        trend: "down",
        icon: <CheckSquareIcon className="h-6 w-6" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        onClick: () => navigate('/tasks'),
      },
      {
        title: "Active Users",
        value: users.filter(u => u.status === 'Active').length.toString(),
        change: "+3%",
        trend: "up",
        icon: <UsersIcon className="h-6 w-6" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        onClick: () => navigate('/users'),
      },
      {
        title: "Pending Timesheets",
        value: timesheets.filter(t => t.status === 'Pending').length.toString(),
        change: "+2%",
        trend: "up",
        icon: <CheckSquareIcon className="h-6 w-6" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        onClick: () => navigate('/timesheet'),
      },
    ];
  }, [clients, projects, tasks, users, timesheets, navigate]);

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Recent clients
    const recentClients = clients
      .sort((a, b) => new Date(b.onboardingDate).getTime() - new Date(a.onboardingDate).getTime())
      .slice(0, 3);
    
    recentClients.forEach(client => {
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        title: `New client onboarded: ${client.name}`,
        subtitle: client.industry,
        date: client.onboardingDate,
        avatar: client.manager.avatar,
        onClick: () => navigate(`/clients/${client.id}`),
      });
    });

    // Recent projects
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    
    recentProjects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        title: `Project started: ${project.name}`,
        subtitle: project.client.name,
        date: project.startDate,
        avatar: project.projectManager.avatar,
        onClick: () => navigate(`/projects/${project.id}`),
      });
    });

    // Recent tasks
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, 3);
    
    recentTasks.forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        title: `Task assigned: ${task.name}`,
        subtitle: task.project.name,
        date: task.createdDate,
        avatar: task.assignedTo.avatar,
        onClick: () => navigate(`/tasks/${task.id}`),
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [clients, projects, tasks, navigate]);

  // Quick stats by category
  const quickStats = useMemo(() => {
    return {
      clients: {
        active: clients.filter(c => c.status === 'Active').length,
        inactive: clients.filter(c => c.status === 'Inactive').length,
        quarterly: clients.filter(c => {
          const onboardingDate = new Date(c.onboardingDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return onboardingDate >= threeMonthsAgo;
        }).length,
      },
      projects: {
        active: projects.filter(p => p.status === 'Active').length,
        completed: projects.filter(p => p.status === 'Completed').length,
        onHold: projects.filter(p => p.status === 'On Hold').length,
        billable: projects.filter(p => p.billingType === 'Billable').length,
      },
      tasks: {
        todo: tasks.filter(t => t.status === 'To Do').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length,
      },
      users: {
        active: users.filter(u => u.status === 'Active').length,
        inactive: users.filter(u => u.status === 'Inactive').length,
        managers: users.filter(u => u.role === 'Manager').length,
        employees: users.filter(u => u.role === 'Employee').length,
      },
      timesheets: {
        pending: timesheets.filter(t => t.status === 'Pending').length,
        approved: timesheets.filter(t => t.status === 'Approved').length,
        rejected: timesheets.filter(t => t.status === 'Rejected').length,
        total: timesheets.length,
      },
    };
  }, [clients, projects, tasks, users, timesheets]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'project':
        return <BriefcaseIcon className="h-4 w-4 text-green-600" />;
      case 'task':
        return <CheckSquareIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <BarChart3Icon className="h-4 w-4 text-gray-600" />;
    }
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
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {/* Header */}
      <header className="w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your workspace.</p>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {overviewStats.map((stat, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUpIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clients & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Clients Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/clients')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Clients</span>
                    <Badge className="bg-green-100 text-green-800">
                      {quickStats.clients.active}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inactive Clients</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {quickStats.clients.inactive}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quarterly Onboards</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {quickStats.clients.quarterly}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Projects Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/projects')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <Badge className="bg-green-100 text-green-800">
                      {quickStats.projects.active}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {quickStats.projects.completed}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Billable Projects</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {quickStats.projects.billable}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timesheets & Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Timesheets Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/timesheet')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Approval</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {quickStats.timesheets.pending}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <Badge className="bg-green-100 text-green-800">
                      {quickStats.timesheets.approved}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <Badge className="bg-red-100 text-red-800">
                      {quickStats.timesheets.rejected}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reports Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/reports')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Reports</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      12
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Reports</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      48
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Custom Reports</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      8
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Tasks & Users */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tasks Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/tasks')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">To Do</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {quickStats.tasks.todo}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {quickStats.tasks.inProgress}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">High Priority</span>
                    <Badge className="bg-red-100 text-red-800">
                      {quickStats.tasks.highPriority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users Overview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/users')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <Badge className="bg-green-100 text-green-800">
                      {quickStats.users.active}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Managers</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {quickStats.users.managers}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Employees</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {quickStats.users.employees}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={activity.onClick}
                >
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                    <Avatar className="w-8 h-8">
                      <img src={activity.avatar} alt="" />
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};