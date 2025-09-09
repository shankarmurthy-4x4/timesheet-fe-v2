import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { taskPriorities, activityTypes } from '../../../data/mockTasks';
import { TaskFormData, TaskProject, TaskUser } from '../../../types/task';
import { taskApi } from '../../../services/taskApi';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  activityId: z.string().min(1, 'Activity is required'),
  assignedToId: z.string().min(1, 'Assign to is required'),
  taskReviewerId: z.string().min(1, 'Task reviewer is required'),
  priority: z.string().min(1, 'Priority is required'),
  activityType: z.string().min(1, 'Activity type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  plannedHours: z.string().min(1, 'Planned hours is required'),
});

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  mode: 'create' | 'edit';
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}) => {
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [assignToSearch, setAssignToSearch] = useState('');
  const [reviewerSearch, setReviewerSearch] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData,
  });

  const selectedProjectId = watch('projectId');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Load projects and users when dialog opens
  React.useEffect(() => {
    if (open) {
      loadProjects();
      loadUsers();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await taskApi.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await taskApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof TaskFormData, value);
      });
    }
  }, [initialData, setValue]);

  React.useEffect(() => {
    if (!open) {
      reset();
      setProjectSearch('');
      setAssignToSearch('');
      setReviewerSearch('');
    }
  }, [open, reset]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredAssignToUsers = users.filter(user =>
    user.name.toLowerCase().includes(assignToSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(assignToSearch.toLowerCase())
  );

  const filteredReviewerUsers = users.filter(user =>
    user.name.toLowerCase().includes(reviewerSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(reviewerSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Task' : 'Edit Task'}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Project Search */}
          {mode === 'create' && (
            <div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search project by name or code"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {projectSearch && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setValue('projectId', project.id);
                        setProjectSearch(`${project.code} / ${project.name}`);
                      }}
                    >
                      <div className="font-medium text-sm">{project.code} / {project.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.projectId && (
                <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>
              )}
            </div>
          )}

          {/* Task Name */}
          <div>
            <Input
              {...register('name')}
              placeholder="Task name"
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Activity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('activityId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject?.activities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activityId && (
                <p className="text-red-500 text-sm mt-1">{errors.activityId.message}</p>
              )}
            </div>
            <div>
              <Select onValueChange={(value) => setValue('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Activity Type and Planned Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('activityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activityType && (
                <p className="text-red-500 text-sm mt-1">{errors.activityType.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register('plannedHours')}
                placeholder="Planned hours (e.g., 2h 30m)"
                className="w-full"
              />
              {errors.plannedHours && (
                <p className="text-red-500 text-sm mt-1">{errors.plannedHours.message}</p>
              )}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <div className="relative">
              <Input
                placeholder="Search and select user to assign"
                value={assignToSearch}
                onChange={(e) => setAssignToSearch(e.target.value)}
                className="w-full"
              />
            </div>
            {assignToSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredAssignToUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setValue('assignedToId', user.id);
                      setAssignToSearch(user.name);
                    }}
                  >
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.assignedToId && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedToId.message}</p>
            )}
          </div>

          {/* Task Reviewer */}
          <div>
            <div className="relative">
              <Input
                placeholder="Search and select task reviewer"
                value={reviewerSearch}
                onChange={(e) => setReviewerSearch(e.target.value)}
                className="w-full"
              />
            </div>
            {reviewerSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredReviewerUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setValue('taskReviewerId', user.id);
                      setReviewerSearch(user.name);
                    }}
                  >
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.taskReviewerId && (
              <p className="text-red-500 text-sm mt-1">{errors.taskReviewerId.message}</p>
            )}
          </div>

          {/* Start Date and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                {...register('startDate')}
                type="date"
                placeholder="Start date"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div className="relative">
              <Input
                {...register('dueDate')}
                type="date"
                placeholder="Due date"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0b57d0] text-white">
              {mode === 'create' ? 'Add task' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};