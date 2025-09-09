import React, { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { projectApi } from '../../../services/projectApi';
import { Project } from '../../../types/project';

interface AssignProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectIds: string[]) => void;
  excludeProjectIds: string[];
}

export const AssignProjectForm: React.FC<AssignProjectFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  excludeProjectIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load projects when dialog opens
  React.useEffect(() => {
    if (open) {
      loadProjects();
    } else {
      setSearchTerm('');
      setSelectedProjects([]);
    }
  }, [open]);

  // Search projects when search term changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      searchProjects();
    } else {
      loadProjects();
    }
  }, [searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectApi.getProjects();
      // Filter out already assigned projects
      const availableProjects = projectsData.filter(project => 
        !excludeProjectIds.includes(project.id) && project.status === 'Active'
      );
      setProjects(availableProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectApi.getProjects();
      // Filter and search
      const availableProjects = projectsData.filter(project => 
        !excludeProjectIds.includes(project.id) && 
        project.status === 'Active' &&
        (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
         project.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setProjects(availableProjects);
    } catch (error) {
      console.error('Failed to search projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedProjects);
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Projects</DialogTitle>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects by name, code, or client"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Projects Count */}
          {selectedProjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProjects([])}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Projects List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No available projects found
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedProjects.includes(project.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleProjectSelection(project.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-sm text-gray-900">
                        {project.code} / {project.name}
                      </h3>
                      <Badge className={`text-xs ${getBillingTypeColor(project.billingType)}`}>
                        {project.billingType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Client:</span> {project.client.name}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {project.type}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {new Date(project.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">End Date:</span> {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {selectedProjects.includes(project.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    {!selectedProjects.includes(project.id) && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
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
            <Button 
              onClick={handleSubmit}
              disabled={selectedProjects.length === 0}
              className="bg-[#0b57d0] text-white hover:bg-blue-700"
            >
              Assign {selectedProjects.length} Project{selectedProjects.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};