import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SearchIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { TaskProject } from '../../../types/task';
import { taskApi } from '../../../services/taskApi';

const activitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string().min(1, 'Task description is required'),
  projectId: z.string().min(1, 'Project is required'),
});

interface ActivityFormData {
  name: string;
  description: string;
  projectId: string;
}

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormData) => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
  });

  // Load projects when dialog opens
  React.useEffect(() => {
    if (open) {
      loadProjects();
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

  React.useEffect(() => {
    if (!open) {
      reset();
      setProjectSearch('');
    }
  }, [open, reset]);

  const handleFormSubmit = (data: ActivityFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    project.code.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Project Search */}
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

          {/* Activity Name */}
          <div>
            <Input
              {...register('name')}
              placeholder="Activity name"
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <textarea
              {...register('description')}
              placeholder="Task Description"
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
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
              Add activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};