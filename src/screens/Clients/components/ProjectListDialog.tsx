import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { projectApi } from '../../../services/projectApi';
import { Project } from '../../../types/project';
import { useNavigate } from 'react-router-dom';

interface ProjectListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export const ProjectListDialog: React.FC<ProjectListDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Load client projects when dialog opens
  useEffect(() => {
    if (open && clientId) {
      loadClientProjects();
    }
  }, [open, clientId]);

  const loadClientProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await projectApi.getProjects();
      // Filter projects for this specific client
      const clientProjects = allProjects.filter(project => project.client.id === clientId);
      setProjects(clientProjects);
    } catch (error) {
      console.error('Failed to load client projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Project List
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#e6e9ee] sticky top-0">
                <TableRow>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Project code
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Project name
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Type
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Start date
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    End date
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Project manager
                  </TableHead>
                  <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project, index) => (
                  <TableRow
                    key={project.id}
                    className={`${index % 2 === 1 ? "bg-[#f6f7f9]" : ""} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                      {project.code}
                    </TableCell>
                    <TableCell className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] hover:underline">
                      {project.name}
                    </TableCell>
                    <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                      {project.type}
                    </TableCell>
                    <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                      {new Date(project.startDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                      {new Date(project.endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-[7px] px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-[30px] w-[30px] rounded">
                          <img
                            src={project.projectManager.avatar}
                            alt={project.projectManager.name}
                            className="object-cover"
                          />
                        </Avatar>
                        <span className="font-normal text-[#172b4d] text-[13px]">
                          {project.projectManager.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 px-3">
                      <Badge
                        className={`font-normal text-[13px] px-2 py-0.5 ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No projects found for {clientName}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};