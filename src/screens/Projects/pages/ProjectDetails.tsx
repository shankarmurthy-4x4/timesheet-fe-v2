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
import { ProjectForm } from '../components/ProjectForm';
import { ActivityForm } from '../components/ActivityForm';
import { AddUsersForm } from '../components/AddUsersForm';
import { projectApi } from '../../../services/projectApi';
import { Project, Activity, ActivityFormData, ProjectFormData } from '../../../types/project';
import toast from 'react-hot-toast';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showAddUsersForm, setShowAddUsersForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Load project data
  React.useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const projectData = await projectApi.getProjectById(id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <Button onClick={() => navigate('/projects')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: Project['status']) => {
    try {
      const updatedProject = await projectApi.updateProjectStatus(project.id, newStatus);
      setProject(updatedProject);
      toast.success(`Project status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update project status');
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    try {
      const updatedProject = await projectApi.updateProject(project.id, data);
      setProject(updatedProject);
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleAddActivity = async (data: ActivityFormData) => {
    try {
      await projectApi.addActivity(data);
      const updatedProject = await projectApi.getProjectById(project.id);
      if (updatedProject) {
        setProject(updatedProject);
        toast.success('Activity added successfully!');
      }
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast.error('Failed to add activity');
    }
  };

  const handleEditActivity = async (data: ActivityFormData) => {
    if (!editingActivity) return;
    
    try {
      await projectApi.updateActivity(project.id, editingActivity.id, data);
      const updatedProject = await projectApi.getProjectById(project.id);
      if (updatedProject) {
        setProject(updatedProject);
        setEditingActivity(null);
        toast.success('Activity updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
      toast.error('Failed to update activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await projectApi.deleteActivity(project.id, activityId);
      const updatedProject = await projectApi.getProjectById(project.id);
      if (updatedProject) {
        setProject(updatedProject);
        toast.success('Activity deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleAddUsers = async (userIds: string[]) => {
    try {
      for (const userId of userIds) {
        await projectApi.addTeamMember(project.id, userId);
      }
      const updatedProject = await projectApi.getProjectById(project.id);
      if (updatedProject) {
        setProject(updatedProject);
        toast.success(`${userIds.length} user(s) added successfully!`);
      }
    } catch (error) {
      console.error('Failed to add users:', error);
      toast.error('Failed to add users');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await projectApi.removeTeamMember(project.id, userId);
      const updatedProject = await projectApi.getProjectById(project.id);
      if (updatedProject) {
        setProject(updatedProject);
        toast.success('User removed successfully!');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Failed to remove user');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectApi.deleteProject(project.id);
      toast.success('Project deleted successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'Completed':
        return 'bg-[#e6f3ff] text-[#0066cc]';
      case 'On Hold':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'Inactive':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'In Progress':
        return 'bg-[#e6f3ff] text-[#0066cc]';
      case 'On Hold':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'Pending':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
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
              onClick={() => navigate('/projects')}
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
                    href="/projects" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/projects');
                    }}
                  >
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {project.code}
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

      {/* Project Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {project.code.split('-')[1]?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-600">{project.code}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Status</span>
                <Select value={project.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
          {/* Project Details */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProjectForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Client name</label>
                  <p 
                    className="text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => navigate(`/clients/${project.client.id}`)}
                  >
                    {project.client.code} / {project.client.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project type</label>
                    <p className="text-sm text-gray-900">{project.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(project.startDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">End date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-sm text-gray-900">{project.duration}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Billing type</label>
                  <p className="text-sm text-gray-900">{project.billingType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account manager</label>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => navigate(`/users/${project.accountManager.id}`)}
                    >
                      <Avatar className="w-6 h-6">
                        <img src={project.accountManager.avatar} alt={project.accountManager.name} />
                      </Avatar>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{project.accountManager.name}</p>
                        <p className="text-xs text-gray-500">{project.accountManager.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project manager</label>
                    <div 
                      className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => navigate(`/users/${project.projectManager.id}`)}
                    >
                      <Avatar className="w-6 h-6">
                        <img src={project.projectManager.avatar} alt={project.projectManager.name} />
                      </Avatar>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">{project.projectManager.name}</p>
                        <p className="text-xs text-gray-500">{project.projectManager.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Project Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{project.name}"? This action cannot be undone and will remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProject}
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

          {/* Assigned Team */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Assigned Team ({project.assignedTeam.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddUsersForm(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {project.assignedTeam.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <img src={member.avatar} alt={member.name} />
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from this project?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveUser(member.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}

                {project.assignedTeam.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No team members assigned yet
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Activities */}
        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Activity ({project.activities.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActivityForm(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {project.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{activity.name}</h3>
                      <Badge className={`text-xs ${getActivityStatusColor(activity.status)}`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingActivity(activity)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{activity.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {project.activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No activities added yet
                </div>
              )}
            </div>

            {/* Pagination for activities */}
            {project.activities.length > 0 && (
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

      {/* Project Form Modal */}
      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        onSubmit={handleEditProject}
        initialData={project}
        mode="edit"
      />

      {/* Activity Form Modal */}
      <ActivityForm
        open={showActivityForm || !!editingActivity}
        onOpenChange={(open) => {
          if (!open) {
            setShowActivityForm(false);
            setEditingActivity(null);
          }
        }}
        onSubmit={editingActivity ? handleEditActivity : handleAddActivity}
        projectId={project.code}
        projectName={project.name}
        initialData={editingActivity || undefined}
        mode={editingActivity ? 'edit' : 'create'}
      />

      {/* Add Users Form Modal */}
      <AddUsersForm
        open={showAddUsersForm}
        onOpenChange={setShowAddUsersForm}
        onSubmit={handleAddUsers}
        excludeUserIds={project.assignedTeam.map(member => member.id)}
      />
    </div>
  );
};