import React, { useState, useMemo } from 'react';
import { SearchIcon, DownloadIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import { reportsApi } from '../../../services/reportsApi';
import { TaskReport, ReportFilter } from '../../../types/reports';
import { useNavigate } from 'react-router-dom';

interface TaskReportTabProps {
  dateRange: ReportFilter['dateRange'];
  onDownload: () => void;
}

export const TaskReportTab: React.FC<TaskReportTabProps> = ({
  dateRange,
  onDownload,
}) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load reports data
  React.useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const reportsData = await reportsApi.getTaskReports({ dateRange });
        setReports(reportsData);
      } catch (error) {
        console.error('Failed to load task reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [dateRange]);

  // Get unique values for filters
  const uniqueProjects = useMemo(() => {
    const projects = reports.map(r => r.projectName);
    return [...new Set(projects)];
  }, [reports]);

  const uniqueActivities = useMemo(() => {
    const activities = reports.map(r => r.activity);
    return [...new Set(activities)];
  }, [reports]);

  const uniqueAssignees = useMemo(() => {
    const assignees = reports.map(r => r.assignedTo);
    return [...new Set(assignees)];
  }, [reports]);

  // Filter and paginate reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.taskName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'all' || report.projectName === projectFilter;
      const matchesActivity = activityFilter === 'all' || report.activity === activityFilter;
      const matchesAssignee = assigneeFilter === 'all' || report.assignedTo === assigneeFilter;
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesProject && matchesActivity && matchesAssignee && matchesPriority && matchesStatus;
    });
  }, [reports, searchTerm, projectFilter, activityFilter, assigneeFilter, priorityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-[#ffebee] text-[#c62828]';
      case 'High':
        return 'bg-[#fff3e0] text-[#ef6c00]';
      case 'Medium':
        return 'bg-[#fff8e1] text-[#f57f17]';
      case 'Low':
        return 'bg-[#e8f5e8] text-[#2e7d32]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'In progress':
        return 'bg-[#e6f3ff] text-[#0066cc]';
      case 'On Hold':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'To Do':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setProjectFilter('all');
    setActivityFilter('all');
    setAssigneeFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading task reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-[400px]">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by task"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onDownload}
            className="bg-[#0b57d0] text-white hover:bg-blue-700"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download report
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex gap-4 items-center">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Project name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {uniqueProjects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            {uniqueActivities.map((activity) => (
              <SelectItem key={activity} value={activity}>
                {activity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Assign to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {uniqueAssignees.map((assignee) => (
              <SelectItem key={assignee} value={assignee}>
                {assignee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In progress">In progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          onClick={handleResetFilters}
          className="text-[#0b57d0] hover:text-blue-700"
        >
          Reset filter
        </Button>
      </div>

      {/* Reports Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Task code
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Task name
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Project name
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Activity
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Assign to
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Priority
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentReports.map((report, index) => (
              <TableRow
                key={report.id}
                className={`${index % 2 === 1 ? "bg-[#f6f7f9]" : ""} cursor-pointer hover:bg-gray-50`}
                onClick={() => navigate(`/tasks/${report.id}`)}
              >
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.taskCode}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <span className="font-medium text-[#0b57d0] text-[13px] hover:underline">
                    {report.taskName}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.projectName}
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.activity}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <img src={report.assignedToAvatar} alt={report.assignedTo} />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px]">
                      {report.assignedTo}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Badge className={`font-normal text-[13px] px-2 py-0.5 ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Badge className={`font-normal text-[13px] px-2 py-0.5 ${getStatusColor(report.status)}`}>
                    {report.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total {filteredReports.length} records
        </div>
        
        <div className="flex items-center gap-4">
          <Select value="10" onValueChange={() => {}}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                      className={pageNumber === currentPage ? "bg-[#172b4d] text-white" : ""}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};