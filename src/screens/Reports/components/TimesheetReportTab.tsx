import React, { useState, useMemo } from 'react';
import { DownloadIcon } from 'lucide-react';
import { DataTable, Column } from '../../../components/ui/data-table';
import { FilterBar, FilterOption } from '../../../components/ui/filter-bar';
import { StatusBadge } from '../../../components/ui/status-badge';
import { UserAvatar } from '../../../components/ui/user-avatar';
import { reportsApi } from '../../../services/reportsApi';
import { TimesheetReport, ReportFilter } from '../../../types/reports';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

interface TimesheetReportTabProps {
  dateRange: ReportFilter['dateRange'];
  onDownload: () => void;
}

export const TimesheetReportTab: React.FC<TimesheetReportTabProps> = ({
  dateRange,
  onDownload,
}) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<TimesheetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [approverFilter, setApproverFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [filterValues, setFilterValues] = useState({
    approver: 'all',
    department: 'all',
    status: 'all'
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('submittedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load reports data
  React.useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const reportsData = await reportsApi.getTimesheetReports({ dateRange });
        setReports(reportsData);
      } catch (error) {
        console.error('Failed to load timesheet reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [dateRange]);

  // Get unique values for filters
  const uniqueApprovers = useMemo(() => {
    const approvers = reports.map(r => r.approverName);
    return [...new Set(approvers)];
  }, [reports]);

  const uniqueDepartments = useMemo(() => {
    const departments = reports.map(r => r.department);
    return [...new Set(departments)];
  }, [reports]);

  // Define filter options
  const filterOptions: FilterOption[] = [
    {
      label: 'Approver name',
      value: 'approver',
      options: uniqueApprovers.map(approver => ({ label: approver, value: approver }))
    },
    {
      label: 'Department',
      value: 'department',
      options: uniqueDepartments.map(department => ({ label: department, value: department }))
    },
    {
      label: 'Status',
      value: 'status',
      options: [
        { label: 'Approved', value: 'Approved' },
        { label: 'Pending for approval', value: 'Pending for approval' },
        { label: 'Rejected', value: 'Rejected' }
      ]
    }
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    if (key === 'approver') setApproverFilter(value);
    if (key === 'department') setDepartmentFilter(value);
    if (key === 'status') setStatusFilter(value);
    
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterValues({
      approver: 'all',
      department: 'all',
      status: 'all'
    });
    setSearchTerm('');
    setApproverFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Filter and paginate reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesApprover = approverFilter === 'all' || report.approverName === approverFilter;
      const matchesDepartment = departmentFilter === 'all' || report.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesApprover && matchesDepartment && matchesStatus;
    });
  }, [reports, searchTerm, approverFilter, departmentFilter, statusFilter]);

  // Define table columns
  const columns: Column<TimesheetReport>[] = [
    {
      header: 'User name',
      accessorKey: 'userName',
      cell: (report) => (
        <UserAvatar
          user={{
            id: report.id,
            name: report.userName,
            avatar: report.userAvatar
          }}
        />
      )
    },
    {
      header: 'Approver name',
      accessorKey: 'approverName',
      cell: (report) => (
        <UserAvatar
          user={{
            name: report.approverName,
            avatar: report.approverAvatar
          }}
          navigable={false}
        />
      )
    },
    {
      header: 'Department',
      accessorKey: 'department'
    },
    {
      header: 'Date range',
      accessorKey: 'dateRange'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (report) => <StatusBadge status={report.status} />
    }
  ];

  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading timesheet reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
      <FilterBar
        filters={filterOptions}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Reports Table */}
      <DataTable
        columns={columns}
        data={filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
        onRowClick={(report) => navigate(`/timesheet/${report.id}`)}
        searchPlaceholder="Search by employee"
        onSearch={setSearchTerm}
        pagination={{
          pageSize: itemsPerPage,
          pageIndex: currentPage - 1,
          totalItems: filteredReports.length,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        sorting={{
          field: sortField,
          direction: sortDirection,
          onSort: handleSort
        }}
      />
    </div>
  );
};