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
import { ProjectForm } from "../../components/ProjectForm";
import { projectTypes, billingTypes, projectStatuses } from "../../../../data/mockProjects";
import { projectApi } from "../../../../services/projectApi";
import { Project, ProjectFormData } from "../../../../types/project";

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [billingFilter, setBillingFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load projects data
  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await projectApi.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Stats data
  const statsCards = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;

    return [
      { value: totalProjects.toString(), label: "Total projects" },
      { value: activeProjects.toString(), label: "Active projects" },
      { value: completedProjects.toString(), label: "Completed projects" },
      { value: onHoldProjects.toString(), label: "On hold projects" },
    ];
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = 
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesType = typeFilter === 'all' || project.type === typeFilter;
      const matchesBilling = billingFilter === 'all' || project.billingType === billingFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesBilling;
    });

    // Sort projects
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
  }, [projects, searchTerm, statusFilter, typeFilter, billingFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddProject = async (data: ProjectFormData) => {
    try {
      const newProject = await projectApi.createProject(data);
      setProjects([...projects, newProject]);
      toast.success('Project added successfully!');
    } catch (error) {
      console.error('Failed to add project:', error);
      toast.error('Failed to add project');
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    
    try {
      const updatedProject = await projectApi.updateProject(editingProject.id, data);
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      setEditingProject(null);
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
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
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {loading && (
        <div className="flex items-center justify-center w-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading projects...</span>
        </div>
      )}

      {/* Header with title and add button */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Projects
        </h1>

        <Button 
          className="bg-[#0b57d0] text-white gap-1"
          onClick={() => setShowProjectForm(true)}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="font-medium text-sm [font-family:'IBM_Plex_Sans',Helvetica]">
            Add project
          </span>
        </Button>
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
              placeholder="Search by project code, name, or client"
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
              {projectStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={billingFilter} onValueChange={setBillingFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Billing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Billing</SelectItem>
              {billingTypes.map((billing) => (
                <SelectItem key={billing} value={billing}>
                  {billing}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects table */}
      <div className="w-full overflow-auto border border-[#e0e3ea] rounded">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center justify-between">
                  Project code
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  Project name
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Client
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center justify-between">
                  Type
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Duration
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Billing type
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Project manager
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
            {currentProjects.map((project, index) => (
              <TableRow
                key={`${project.code}-${index}`}
                className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}
              >
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {project.code}
                </TableCell>
                <TableCell 
                  className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 cursor-pointer hover:underline"
                  onClick={() => handleProjectClick(project)}
                >
                  {project.name}
                </TableCell>
                <TableCell 
                  className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 cursor-pointer hover:underline"
                  onClick={() => navigate(`/clients/${project.client.id}`)}
                >
                  {project.client.name}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {project.type}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {project.duration}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 px-2 py-0.5 ${getBillingTypeColor(project.billingType)}`}
                  >
                    {project.billingType}
                  </Badge>
                </TableCell>
                <TableCell 
                  className="py-[7px] px-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/users/${project.projectManager.id}`)}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-[30px] w-[30px] rounded">
                      <img
                        src={project.projectManager.avatar}
                        alt={project.projectManager.name}
                        className="object-cover"
                      />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                      {project.projectManager.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 px-2 py-0.5 ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No projects found matching your criteria.
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

      {/* Project Form Modal */}
      <ProjectForm
        open={showProjectForm || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setShowProjectForm(false);
            setEditingProject(null);
          }
        }}
        onSubmit={editingProject ? handleEditProject : handleAddProject}
        initialData={editingProject || undefined}
        mode={editingProject ? 'edit' : 'create'}
      />
    </section>
  );
};