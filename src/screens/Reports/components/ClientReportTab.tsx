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
import { ClientReport, ReportFilter } from '../../../types/reports';
import { useNavigate } from 'react-router-dom';
import { mockClientReports } from '../../../data/mockReports';

interface ClientReportTabProps {
  dateRange: ReportFilter['dateRange'];
  onDownload: () => void;
}

export const ClientReportTab: React.FC<ClientReportTabProps> = ({
  dateRange,
  onDownload,
}) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load reports data
  React.useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        // Ensure we're getting data even if the API returns empty
        let reportsData = await reportsApi.getClientReports({ dateRange });
        if (reportsData.length === 0) {
          console.log('No client reports returned from API, using mock data');
          reportsData = mockClientReports;
        }
        setReports(reportsData);
      } catch (error) {
        console.error('Failed to load client reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [dateRange]);

  // Get unique values for filters
  const uniqueCountries = useMemo(() => {
    const countries = reports.map(r => r.country);
    return [...new Set(countries)];
  }, [reports]);

  const uniqueIndustries = useMemo(() => {
    const industries = reports.map(r => r.industry);
    return [...new Set(industries)];
  }, [reports]);

  const uniqueManagers = useMemo(() => {
    const managers = reports.map(r => r.accountManager);
    return [...new Set(managers)];
  }, [reports]);

  // Filter and paginate reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = countryFilter === 'all' || report.country === countryFilter;
      const matchesIndustry = industryFilter === 'all' || report.industry === industryFilter;
      const matchesManager = managerFilter === 'all' || report.accountManager === managerFilter;
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      
      return matchesSearch && matchesCountry && matchesIndustry && matchesManager && matchesStatus;
    });
  }, [reports, searchTerm, countryFilter, industryFilter, managerFilter, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#d4f9de] text-[#08872c]';
      case 'Inactive':
        return 'bg-[#ffe8dd] text-[#aa3f00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCountryFilter('all');
    setIndustryFilter('all');
    setManagerFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading client reports...</span>
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
            placeholder="Search by client name"
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
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {uniqueCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {uniqueIndustries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={managerFilter} onValueChange={setManagerFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Account manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Managers</SelectItem>
            {uniqueManagers.map((manager) => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
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
                Client code
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Client name
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Email address
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Country
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Industry
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Projects
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] py-3 px-4">
                Account manager
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
                onClick={() => navigate(`/clients/${report.id}`)}
              >
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.clientCode}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <span className="font-medium text-[#0b57d0] text-[13px] hover:underline">
                    {report.clientName}
                  </span>
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.email}
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.country}
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.industry}
                </TableCell>
                <TableCell className="py-3 px-4 font-normal text-[#172b4d] text-[13px]">
                  {report.projects}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <img src={report.accountManagerAvatar} alt={report.accountManager} />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px]">
                      {report.accountManager}
                    </span>
                  </div>
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