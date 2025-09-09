import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, PlusIcon, TrashIcon, HomeIcon } from 'lucide-react';
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
import { UserForm } from '../components/UserForm';
import { AssignProjectForm } from '../components/AssignProjectForm';
import { userApi } from '../../../services/userApi';
import { User, UserFormData, AssignProjectFormData } from '../../../types/user';
import toast from 'react-hot-toast';

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAssignProjectForm, setShowAssignProjectForm] = useState(false);

  // Load user data
  React.useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const userData = await userApi.getUserById(id);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        toast.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
        <Button onClick={() => navigate('/users')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
    try {
      const updatedUser = await userApi.updateUserStatus(user.id, newStatus);
      setUser(updatedUser);
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    try {
      const updatedUser = await userApi.updateUser(user.id, data);
      setUser(updatedUser);
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleAssignProjects = async (projectIds: string[]) => {
    try {
      const updatedUser = await userApi.assignProjects(user.id, { projectIds });
      setUser(updatedUser);
      toast.success(`${projectIds.length} project(s) assigned successfully!`);
    } catch (error) {
      console.error('Failed to assign projects:', error);
      toast.error('Failed to assign projects');
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    try {
      const updatedUser = await userApi.removeProject(user.id, projectId);
      setUser(updatedUser);
      toast.success('Project removed successfully!');
    } catch (error) {
      console.error('Failed to remove project:', error);
      toast.error('Failed to remove project');
    }
  };

  const getBillingTypeColor = (billingType: string) => {
    switch (billingType) {
      case 'Billable':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'Non-Billable':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      case 'Internal':
        return 'bg-[#e6f3ff] text-[#0066cc]';
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
              onClick={() => navigate('/users')}
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
                    href="/users" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/users');
                    }}
                  >
                    Users
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {user.code}
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

      {/* User Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src={user.avatar} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Status</span>
                <Select value={user.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
          {/* User Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User code</label>
                  <p className="text-sm text-gray-900">{user.code}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-sm text-gray-900">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-sm text-gray-900">{user.department}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Reporting manager</label>
                  <div 
                    className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => navigate(`/users/${user.reportingManager.id}`)}
                  >
                    <Avatar className="w-6 h-6">
                      <img src={user.reportingManager.avatar} alt={user.reportingManager.name} />
                    </Avatar>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">{user.reportingManager.name}</p>
                      <p className="text-xs text-gray-500">{user.reportingManager.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Total logged hours</label>
                  <p className="text-sm text-gray-900">{user.totalLoggedHours}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Projects */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Assigned Projects ({user.assignedProjects.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssignProjectForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {user.assignedProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.code} / {project.name}
                        </span>
                        <Badge className={`text-xs ${getBillingTypeColor(project.billingType)}`}>
                          {project.billingType}
                        </Badge>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{project.name}" from this user's assignments?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveProject(project.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-500">Client name</label>
                        <p 
                          className="text-blue-600 font-medium cursor-pointer hover:underline"
                          onClick={() => navigate(`/clients/${project.client.id}`)}
                        >
                          {project.client.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">Project type</label>
                        <p className="text-gray-900">{project.type}</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Start date</label>
                        <p className="text-gray-900">
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">End date</label>
                        <p className="text-gray-900">
                          {new Date(project.endDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {user.assignedProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No projects assigned yet
                  </div>
                )}
              </div>

              {/* Pagination for projects */}
              {user.assignedProjects.length > 0 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button variant="outline" size="sm">
                    <ArrowLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowLeftIcon className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* User Form Modal */}
      <UserForm
        open={showUserForm}
        onOpenChange={setShowUserForm}
        onSubmit={handleEditUser}
        initialData={user}
        mode="edit"
      />

      {/* Assign Project Form Modal */}
      <AssignProjectForm
        open={showAssignProjectForm}
        onOpenChange={setShowAssignProjectForm}
        onSubmit={handleAssignProjects}
        excludeProjectIds={user.assignedProjects.map(project => project.id)}
      />
    </div>
  );
};