import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SearchIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { roles, departments } from '../../../data/mockUsers';
import { UserFormData, User } from '../../../types/user';
import { userApi } from '../../../services/userApi';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  reportingManagerId: z.string().min(1, 'Reporting manager is required'),
});

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: Partial<User>;
  mode: 'create' | 'edit';
}

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      role: initialData.role,
      department: initialData.department,
      reportingManagerId: initialData.reportingManager?.id,
    } : undefined,
  });

  const selectedRole = watch('role');
  const selectedDepartment = watch('department');

  // Load users when dialog opens
  React.useEffect(() => {
    if (open) {
      loadUsers();
      if (initialData?.reportingManager) {
        setManagerSearch(initialData.reportingManager.name);
      }
      // Set form values when editing
      if (initialData && mode === 'edit') {
        setValue('firstName', initialData.firstName || '');
        setValue('lastName', initialData.lastName || '');
        setValue('email', initialData.email || '');
        setValue('role', initialData.role || '');
        setValue('department', initialData.department || '');
        setValue('reportingManagerId', initialData.reportingManager?.id || '');
      }
    }
  }, [open, initialData, mode, setValue]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await userApi.getUsers();
      // Filter out current user if editing
      const availableUsers = initialData ? 
        usersData.filter(user => user.id !== initialData.id) : 
        usersData;
      setUsers(availableUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    if (!open) {
      reset();
      setManagerSearch('');
    }
  }, [open, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
    onOpenChange(false);
    reset();
  };

  const filteredManagers = users.filter(user =>
    user.firstName.toLowerCase().includes(managerSearch.toLowerCase()) ||
    user.lastName.toLowerCase().includes(managerSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(managerSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add User' : 'Edit User'}</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                {...register('firstName')}
                placeholder="First name"
                className="w-full"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Input
                {...register('lastName')}
                placeholder="Last name"
                className="w-full"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email address"
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <Select 
              value={selectedRole} 
              onValueChange={(value) => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <Select 
              value={selectedDepartment} 
              onValueChange={(value) => setValue('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
            )}
          </div>

          {/* Reporting Manager */}
          <div>
            <div className="relative">
              <Input
                placeholder="Search and select reporting manager"
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                className="w-full"
              />
            </div>
            {managerSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredManagers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      setValue('reportingManagerId', user.id);
                      setManagerSearch(`${user.firstName} ${user.lastName}`);
                    }}
                  >
                    <img src={user.avatar} alt={user.firstName} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.reportingManagerId && (
              <p className="text-red-500 text-sm mt-1">{errors.reportingManagerId.message}</p>
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
              {mode === 'create' ? 'Add user' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};