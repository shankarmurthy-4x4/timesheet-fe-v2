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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { clientApi } from "../../../../services/clientApi";
import { projectApi } from "../../../../services/projectApi";
import { taskApi } from "../../../../services/taskApi";
import { userApi } from "../../../../services/userApi";
import { Client } from "../../../../types/client";
import { Project } from "../../../../types/project";
import { Task } from "../../../../types/task";
import { User } from "../../../../types/user";
import { timesheetApi } from "../../../../services/timesheetApi";

export const AdminDashboardSection = (): JSX.Element => {
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

  // Calculate main stats for admin view
  const mainStats = useMemo(() => {
    const onTimeSubmissionRatio = 90; // Mock percentage
    const pendingApprovals = timesheets.filter(t => t.status === 'Pending').length;
    const myTasks = tasks.filter(t => t.status !== 'Completed').length;
    const myProjects = projects.filter(p => p.status === 'Active').length;

    return [
      {
        value: `${onTimeSubmissionRatio}%`,
        label: "On-time timesheet submission ratio",
        change: "↓ 15%",
        trend: "down",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        value: pendingApprovals,
        label: "Timesheet pending for approval",
        change: "",
        trend: "neutral",
        icon: <CheckSquareIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        value: myTasks,
        label: "My task",
        change: "",
        trend: "neutral",
        icon: <CheckSquareIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        value: myProjects,
        label: "My projects",
        change: "",
        trend: "neutral",
        icon: <BriefcaseIcon className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
    ];
  }, [tasks, timesheets, projects]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').slice(0, 5);
  }, [tasks]);

  // Get projects closing soon
  const projectsClosingSoon = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return projects.filter(p => {
      const endDate = new Date(p.endDate);
      return endDate <= thirtyDaysFromNow && p.status === 'Active';
    }).slice(0, 3);
  }, [projects]);

  // Important alerts for admin
  const importantAlerts = useMemo(() => {
    const alerts = [];
    
    // 2 members timesheet not submitted yet
    const notSubmittedCount = users.filter(u => u.status === 'Active').length - timesheets.filter(t => t.status !== 'Pending').length;
    if (notSubmittedCount > 0) {
      alerts.push({
        id: '1',
        type: 'warning',
        title: `${notSubmittedCount} members timesheet not submitted yet`,
        time: '10 min ago',
        onClick: () => navigate('/timesheet'),
      });
    }

    // Project without task
    const projectsWithoutTasks = projects.filter(p => 
      p.status === 'Active' && tasks.filter(t => t.project.id === p.id).length === 0
    );
    if (projectsWithoutTasks.length > 0) {
      alerts.push({
        id: '2',
        type: 'warning',
        title: `Project without task → ${projectsWithoutTasks[0].code}`,
        time: '10 min ago',
        onClick: () => navigate(`/projects/${projectsWithoutTasks[0].id}`),
      });
    }

    // 2 task missed deadline
    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    );
    if (overdueTasks.length >= 2) {
      alerts.push({
        id: '3',
        type: 'warning',
        title: `2 task missed deadline → ${overdueTasks[0].code}, ${overdueTasks[1].code}`,
        time: '14 July 2025',
        onClick: () => navigate('/tasks'),
      });
    }

    // User not assigned in Task
    if (overdueTasks.length > 0) {
      alerts.push({
        id: '4',
        type: 'warning',
        title: `User not assigned in Task → ${overdueTasks[0].code}`,
        time: '2 hour ago',
        onClick: () => navigate(`/tasks/${overdueTasks[0].id}`),
      });
    }

    // Task overdue
    if (overdueTasks.length > 0) {
      alerts.push({
        id: '5',
        type: 'error',
        title: `Task "${overdueTasks[0].code}" is overdue`,
        time: '2 hour ago',
        onClick: () => navigate(`/tasks/${overdueTasks[0].id}`),
      });
    }

    // 2 project closing soon
    if (projectsClosingSoon.length >= 2) {
      alerts.push({
        id: '6',
        type: 'warning',
        title: `2 project closing soon`,
        time: '2 days ago',
        onClick: () => navigate('/projects'),
      });
    }

    // Project completed
    const completedProjects = projects.filter(p => p.status === 'Completed');
    if (completedProjects.length > 0) {
      alerts.push({
        id: '7',
        type: 'success',
        title: `"Alpha One" Project completed on time.`,
        time: '2 days ago',
        onClick: () => navigate(`/projects/${completedProjects[0].id}`),
      });
    }

    return alerts.slice(0, 7);
  }, [projects, tasks, timesheets, users, navigate, projectsClosingSoon]);

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
          <Card key={index} className="bg-blue-100 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1 rounded ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${stat.trend === 'down' ? 'text-red-600' : 'text-green-600'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Overdue task ({overdueTasks.length})
              </h3>
              
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Task code
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Task name
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Due date
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Project manager
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueTasks.map((task, index) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="py-3 px-4 text-sm text-gray-900">
                        {task.code}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span 
                          className="text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          {task.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <img src={task.assignedBy.avatar} alt={task.assignedBy.name} />
                          </Avatar>
                          <span className="text-sm text-gray-900">{task.assignedBy.name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {overdueTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No overdue tasks
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Closing Soon */}
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project closing soon ({projectsClosingSoon.length})
              </h3>
              
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Project code
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Project name
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      End date
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 text-sm py-3 px-4">
                      Assign to
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsClosingSoon.map((project, index) => (
                    <TableRow key={project.id} className="hover:bg-gray-50">
                      <TableCell className="py-3 px-4 text-sm text-gray-900">
                        {project.code}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span 
                          className="text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.name}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-gray-900">
                        {new Date(project.endDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <img src={project.projectManager.avatar} alt={project.projectManager.name} />
                          </Avatar>
                          <span className="text-sm text-gray-900">{project.projectManager.name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {projectsClosingSoon.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No projects closing soon
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Important Alerts */}
        <Card className="bg-orange-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Important alerts</h3>
            </div>
            
            <div className="space-y-4">
              {importantAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors"
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
                <div className="flex items-center justify-between pt-4 border-t border-orange-200">
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