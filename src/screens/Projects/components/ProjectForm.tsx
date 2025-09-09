import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, SearchIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { projectTypes, billingTypes } from '../../../data/mockProjects';
import { ProjectFormData } from '../../../types/project';
import { clientApi } from '../../../services/clientApi';
import { projectApi } from '../../../services/projectApi';
import { Client, User } from '../../../types/project';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  clientId: z.string().min(1, 'Client is required'),
  type: z.string().min(1, 'Project type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  billingType: z.string().min(1, 'Billing type is required'),
  projectManagerId: z.string().optional(),
});

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
  mode: 'create' | 'edit';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData,
  });

  // Load clients and users when dialog opens
  React.useEffect(() => {
    if (open) {
      loadClients();
      loadUsers();
    }
  }, [open]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientsData = await clientApi.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await projectApi.getUsers();
      setUsers(usersData.filter(user => user.role.includes('Manager') || user.role.includes('Lead')));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof ProjectFormData, value);
      });
    }
  }, [initialData, setValue]);

  React.useEffect(() => {
    if (!open) {
      reset();
      setClientSearch('');
    }
  }, [open, reset]);

  const handleFormSubmit = (data: ProjectFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.code.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Project' : 'Edit Project'}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Client Search */}
          {mode === 'create' && (
            <div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search client by name or code"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {clientSearch && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setValue('clientId', client.id);
                        setClientSearch(`${client.code} / ${client.name}`);
                      }}
                    >
                      <div className="font-medium text-sm">{client.code} / {client.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.clientId && (
                <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
              )}
            </div>
          )}

          {/* Project Name */}
          <div>
            <Input
              {...register('name')}
              placeholder="Project name"
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Project Type and Billing Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select onValueChange={(value) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>
            <div>
              <Select onValueChange={(value) => setValue('billingType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Billing type" />
                </SelectTrigger>
                <SelectContent>
                  {billingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.billingType && (
                <p className="text-red-500 text-sm mt-1">{errors.billingType.message}</p>
              )}
            </div>
          </div>

          {/* Start Date and End Date */}
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
                {...register('endDate')}
                type="date"
                placeholder="End date"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Assign Project Manager */}
          <div>
            <Select onValueChange={(value) => setValue('projectManagerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Assign project manager (optional)" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {mode === 'create' ? 'Add project' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};