import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
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
import { timesheetStatuses, departments } from "../../../../data/mockTimesheets";
import { timesheetApi } from "../../../../services/timesheetApi";
import { TimesheetEntry, TimesheetStats } from "../../../../types/timesheet";
import { DateRangePicker } from "../../../../components/ui/date-picker";

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [stats, setStats] = useState<TimesheetStats>({ totalEntries: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [sortField, setSortField] = useState<keyof TimesheetEntry>('submittedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([]);

  // Load timesheets data
  React.useEffect(() => {
    const loadTimesheets = async () => {
      try {
        setLoading(true);
        const [timesheetsData, statsData] = await Promise.all([
          timesheetApi.getTimesheets(),
          timesheetApi.getTimesheetStats(),
        ]);
        setTimesheets(timesheetsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load timesheets:', error);
        toast.error('Failed to load timesheets');
      } finally {
        setLoading(false);
      }
    };

    loadTimesheets();
  }, []);

  // Stats cards
  const statsCards = useMemo(() => [
    { value: stats.totalEntries.toString(), label: "Entries" },
    { value: stats.approved.toString(), label: "Approved" },
    { value: stats.pending.toString(), label: "Pending" },
    { value: stats.rejected.toString(), label: "Rejected" },
  ], [stats]);

  // Filter and sort timesheets
  const filteredAndSortedTimesheets = useMemo(() => {
    let filtered = timesheets.filter(timesheet => {
      const matchesSearch = 
        timesheet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.approverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || timesheet.department === departmentFilter;
      
      let matchesDateRange = true;
      if (dateRange.from && dateRange.to) {
        const timesheetStart = new Date(timesheet.dateRange.startDate);
        const timesheetEnd = new Date(timesheet.dateRange.endDate);
        matchesDateRange = (timesheetStart >= dateRange.from && timesheetEnd <= dateRange.to) ||
                          (timesheetStart <= dateRange.to && timesheetEnd >= dateRange.from);
      }
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesDateRange;
    });

    // Sort timesheets
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
  }, [timesheets, searchTerm, statusFilter, departmentFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTimesheets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTimesheets = filteredAndSortedTimesheets.slice(startIndex, endIndex);

  const handleSort = (field: keyof TimesheetEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleTimesheetClick = (timesheet: TimesheetEntry) => {
    navigate(`/timesheet/${timesheet.userId}`);
  };

  const handleSelectTimesheet = (timesheetId: string) => {
    setSelectedTimesheets(prev => 
      prev.includes(timesheetId) 
        ? prev.filter(id => id !== timesheetId)
        : [...prev, timesheetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTimesheets.length === currentTimesheets.length) {
      setSelectedTimesheets([]);
    } else {
      setSelectedTimesheets(currentTimesheets.map(t => t.id));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedTimesheets.length === 0) {
      toast.error('Please select timesheets to process');
      return;
    }

    try {
      await timesheetApi.updateTimesheetStatus({
        timesheetIds: selectedTimesheets,
        action,
        comment: action === 'approve' ? 'Bulk approved' : 'Bulk rejected',
      });
      
      // Reload timesheets
      const [timesheetsData, statsData] = await Promise.all([
        timesheetApi.getTimesheets(),
        timesheetApi.getTimesheetStats(),
      ]);
      setTimesheets(timesheetsData);
      setStats(statsData);
      setSelectedTimesheets([]);
      
      toast.success(`${selectedTimesheets.length} timesheet(s) ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} timesheets:`, error);
      toast.error(`Failed to ${action} timesheets`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'Pending':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'Rejected':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getFullYear()} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getFullYear()}`;
  };

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {loading && (
        <div className="flex items-center justify-center w-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading timesheets...</span>
        </div>
      )}

      {/* Header with title and date range filter */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Timesheet
        </h1>

        <div className="relative">
          <Input
            type="text"
            placeholder="Select date range"
            value=""
            className="w-[300px] pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
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
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 gap-1"
          >
            <FilterIcon className="h-4 w-4" />
            <span className="font-medium text-sm">Filter</span>
          </Button>
        </div>
      </div>

      {/* Timesheets table */}
      <div className="w-full overflow-auto border border-[#e0e3ea] rounded">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedTimesheets.length === currentTimesheets.length && currentTimesheets.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center justify-between">
                  User name
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                Approver name
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center justify-between">
                  Department
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3">
                Date range
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
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
            {currentTimesheets.map((timesheet, index) => (
              <TableRow
                key={timesheet.id}
                className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}
              >
                <TableCell className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedTimesheets.includes(timesheet.id)}
                    onChange={() => handleSelectTimesheet(timesheet.id)}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell 
                  className="py-[7px] px-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleTimesheetClick(timesheet)}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-[30px] w-[30px] rounded">
                      <img
                        src={timesheet.userAvatar}
                        alt={timesheet.userName}
                        className="object-cover"
                      />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px] hover:underline">
                      {timesheet.userName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-[7px] px-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-[30px] w-[30px] rounded">
                      <img
                        src={timesheet.approverAvatar}
                        alt={timesheet.approverName}
                        className="object-cover"
                      />
                    </Avatar>
                    <span className="font-normal text-[#172b4d] text-[13px]">
                      {timesheet.approverName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                  {timesheet.department}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px]">
                  {formatDateRange(timesheet.dateRange.startDate, timesheet.dateRange.endDate)}
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] px-2 py-0.5 ${getStatusColor(timesheet.status)}`}
                  >
                    {timesheet.status === 'Pending' ? 'Pending for approval' : timesheet.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentTimesheets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No timesheets found matching your criteria.
          </div>
        )}
      </div>

      {/* Action buttons and pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => handleBulkAction('approve')}
            disabled={selectedTimesheets.length === 0}
            className="bg-[#172b4d] text-white hover:bg-[#0f1f3a]"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkAction('reject')}
            disabled={selectedTimesheets.length === 0}
            className="text-gray-600 border-gray-300"
          >
            <XIcon className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>

        <div className="flex items-center gap-4">
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
      </div>
    </section>
  );
};