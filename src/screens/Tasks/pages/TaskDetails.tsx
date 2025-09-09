import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, TrashIcon, HomeIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../../../components/ui/alert-dialog';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '../../../components/ui/breadcrumb';
import { TaskForm } from '../components/TaskForm';
import { taskApi } from '../../../services/taskApi';
import { Task, TaskFormData } from '../../../types/task';
import toast from 'react-hot-toast';

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Load task data
  React.useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const taskData = await taskApi.getTaskById(id);
        setTask(taskData);
      } catch (error) {
        console.error('Failed to load task:', error);
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Task not found</h1>
        <Button onClick={() => navigate('/tasks')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(task.id, newStatus);
      setTask(updatedTask);
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleEditTask = async (data: TaskFormData) => {
    try {
      const updatedTask = await taskApi.updateTask(task.id, data);
      setTask(updatedTask);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await taskApi.deleteTask(task.id);
      toast.success('Task deleted successfully!');
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'In Progress':
        return 'bg-[#e6f3ff] text-[#0066cc]';
      case 'On Hold':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'To Do':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-[#ffebee] text-[#c62828]';
      case 'High':
        return 'bg-[#fff3e0] text-[#ef6c00]';
      case 'Medium':
        return 'bg-[#fff8e1] text-[#f57f17]';
      case 'Low':
        return 'bg-[#e8f5e8] text-[#2e7d32]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/dashboard" 
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                  >
                    <HomeIcon className="h-4 w-4" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/tasks" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/tasks');
                    }}
                  >
                    Tasks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {task.code}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300"
          >
            Export data
          </Button>
        </div>
      </div>

      {/* Task Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {task.code.split('-')[1]?.charAt(0) || 'T'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-600">{task.code}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Status</span>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Description */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Description</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Task Description</label>
                  <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                    {task.description}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Comments</h3>
                  <div className="text-sm text-gray-500">
                    {task.comments || 'Comments'}
                  </div>
                </div>
              </div>

              {/* Delete Task Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete task
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteTask}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>

          {/* Task Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTaskForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned to</label>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => navigate(`/users/${task.assignedTo.id}`)}
                    >
                      <Avatar className="w-6 h-6">
                        <img src={task.assignedTo.avatar} alt={task.assignedTo.name} />
                      </Avatar>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{task.assignedTo.name}</p>
                        <p className="text-xs text-gray-500">{task.assignedTo.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned by</label>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => navigate(`/users/${task.assignedBy.id}`)}
                    >
                      <Avatar className="w-6 h-6">
                        <img src={task.assignedBy.avatar} alt={task.assignedBy.name} />
                      </Avatar>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{task.assignedBy.name}</p>
                        <p className="text-xs text-gray-500">{task.assignedBy.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Task reviewer</label>
                  <div 
                    className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => navigate(`/users/${task.taskReviewer.id}`)}
                  >
                    <Avatar className="w-6 h-6">
                      <img src={task.taskReviewer.avatar} alt={task.taskReviewer.name} />
                    </Avatar>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">{task.taskReviewer.name}</p>
                      <p className="text-xs text-gray-500">{task.taskReviewer.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Activity</label>
                    <p className="text-sm text-gray-900">{task.activity.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <Badge className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Activity type</label>
                    <p className="text-sm text-gray-900">{task.activityType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(task.createdDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(task.startDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Due date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Frequency</label>
                    <p className="text-sm text-gray-900">{task.frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Planned hours</label>
                    <p className="text-sm text-gray-900">{task.plannedHours}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Last updated</label>
                  <p className="text-sm text-gray-900">{task.lastUpdated}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Project name</label>
                  <p 
                    className="text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/projects/${task.project.id}`)}
                  >
                    {task.project.code} / {task.project.name}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={handleEditTask}
        initialData={task}
        mode="edit"
      />
    </div>
  );
};