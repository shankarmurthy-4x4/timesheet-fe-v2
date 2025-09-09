import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { ActivityFormData } from '../../../types/project';

const activitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string().min(1, 'Task description is required'),
  projectId: z.string(),
});

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormData) => void;
  projectId: string;
  projectName: string;
  initialData?: Partial<ActivityFormData>;
  mode: 'create' | 'edit';
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  projectId,
  projectName,
  initialData,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      projectId,
      ...initialData,
    },
  });

  React.useEffect(() => {
    setValue('projectId', projectId);
  }, [projectId, setValue]);

  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof ActivityFormData, value);
      });
    }
  }, [initialData, setValue]);

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = (data: ActivityFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Activity' : 'Edit Activity'}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Project Name (Read-only) */}
          <div>
            <Input
              value={`${projectId} / ${projectName}`}
              disabled
              className="w-full bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Project name</p>
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
              {mode === 'create' ? 'Add activity' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};