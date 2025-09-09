import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { TaskForm } from "../../components/TaskForm";
import { ActivityForm } from "../../components/ActivityForm";
import { taskPriorities, taskStatuses } from "../../../../data/mockTasks";
import { taskApi } from "../../../../services/taskApi";
import { Task, TaskFormData } from "../../../../types/task";

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Task>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dateRange, setDateRange] = useState('');

  // Load tasks data
  React.useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await taskApi.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Stats data
  const statsCards = useMemo(() => {
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'To Do').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    return [
      { value: totalTasks.toString(), label: "Total Task" },
      { value: todoTasks.toString(), label: "To Do Task" },
      { value: inProgressTasks.toString(), label: "In progress Task" },
      { value: completedTasks.toString(), label: "Completed Task" },
    ];
  }, [tasks]);

  // Get unique projects for filter
  const uniqueProjects = useMemo(() => {
    const projects = tasks.map(task => task.project);
    const uniqueProjectsMap = new Map();
    projects.forEach(project => {
      uniqueProjectsMap.set(project.id, project);
    });
    return Array.from(uniqueProjectsMap.values());
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = 
        task.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || task.project.id === projectFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'object' && aValue !== null) {
        aValue = (aValue as any).name || '';
      }
      if (typeof bValue === 'object' && bValue !== null) {
        bValue = (bValue as any).name || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddTask = async (data: TaskFormData) => {
    try {
      const newTask = await taskApi.createTask(data);
      setTasks([...tasks, newTask]);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    
    try {
      const updatedTask = await taskApi.updateTask(editingTask.id, data);
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleAddActivity = async (data: { name: string; description: string; projectId: string }) => {
    try {
      await taskApi.addActivity(data);
      toast.success('Activity added successfully!');
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/tasks/${task.id}`);
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

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {loading && (
        <div className="flex items-center justify-center w-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Header with title and action buttons */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Tasks
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Select date range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-[200px] pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          
          <Button 
            variant="outline"
            className="text-gray-600 border-gray-300 gap-1"
            onClick={() => setShowActivityForm(true)}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="font-medium text-sm">Add activity</span>
          </Button>

          <Button 
            className="bg-[#0b57d0] text-white gap-1"
            onClick={() => setShowTaskForm(true)}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="font-medium text-sm">Add task</span>
          </Button>
        </div>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {statsCards.map((card, index) => (
          <Card
            key={index}
            className="bg-[linear-gradient(0deg,rgba(230,244,241,1)_0%,rgba(231,238,250,1)_100%)] border-none"
          >
            <CardContent className="p-6 flex flex-col">
              <span className="text-[32px] font-normal text-[#172b4d] [font-family:'IBM_Plex_Sans',Helvetica] leading-normal">
                {card.value}
              </span>
              <span className="font-medium text-[#172b4d] text-base [font-family:'IBM_Plex_Sans',Helvetica] leading-normal">
                {card.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
        <div className="relative w-full md:w-[334.5px]">
          <div className="flex items-center gap-2 px-3 py-3.5 bg-[#f6f7f9] rounded border border-[#e0e3ea]">
            <SearchIcon className="h-4 w-4 text-[#535969]" />
            <Input
              className="border-0 bg-transparent p-0 shadow-none h-auto font-form-placeholder text-[#535969] text-[length:var(--form-placeholder-font-size)] tracking-[var(--form-placeholder-letter-spacing)] leading-[var(--form-placeholder-line-height)]"
              placeholder="Search by task code, name, project, activity or assignee"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {taskStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {taskPriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {uniqueProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks table */}
      <div className="w-full overflow-auto border border-[#e0e3ea] rounded">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center justify-between">
                  Task code
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  Task name
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Project name
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Activity
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Assign to
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center justify-between">
                  Priority
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-between">
                  Status
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTasks.map((task, index) => (
              <TableRow
                key={`${task.code}-${index}`}
                className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}
              >
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {task.code}
                </TableCell>
                <TableCell 
                  className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 cursor-pointer hover:underline"
                  onClick={() => handleTaskClick(task)}
                >
                  {task.name}
                </TableCell>
                <TableCell 
                  className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 cursor-pointer hover:underline"
                  onClick={() => navigate(`/projects/${task.project.id}`)}
                >
                  {task.project.name}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {task.activity.name}
                </TableCell>
                <TableCell 
                  className="py-[7px] px-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/users/${task.assignedTo.id}`)}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-[30px] w-[30px] rounded">
                      <img
                        src={task.assignedTo.avatar}
                        alt={task.assignedTo.name}
                        className="object-cover"
                      />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                      {task.assignedTo.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 px-2 py-0.5 ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 px-2 py-0.5 ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
          setItemsPerPage(Number(value));
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-[135px] h-11 bg-[#f6f7f9] border-[#e0e3ea]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Per page 5</SelectItem>
            <SelectItem value="10">Per page 10</SelectItem>
            <SelectItem value="20">Per page 20</SelectItem>
            <SelectItem value="50">Per page 50</SelectItem>
          </SelectContent>
        </Select>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                className={`text-[#707585] ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    className={`px-3 py-2 ${pageNumber === currentPage ? "bg-[#172b4d] text-white" : "text-[#172b4d]"}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis className="text-[#172b4d]" />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                className={`text-[#172b4d] ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              >
                Next
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={showTaskForm || !!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setShowTaskForm(false);
            setEditingTask(null);
          }
        }}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        initialData={editingTask || undefined}
        mode={editingTask ? 'edit' : 'create'}
      />

      {/* Activity Form Modal */}
      <ActivityForm
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
        onSubmit={handleAddActivity}
      />
    </section>
  );
};