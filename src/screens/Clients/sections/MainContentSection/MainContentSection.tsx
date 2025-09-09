import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  FilterIcon,
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
import { ClientForm } from "../../components/ClientForm";
import { industries } from "../../../../data/mockClients";
import { clientApi } from "../../../../services/clientApi";
import { Client, ClientFormData } from "../../../../types/client";

export const MainContentSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Client>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Load clients data
  React.useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientsData = await clientApi.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to load clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  // Stats data
  const statsCards = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const inactiveClients = clients.filter(c => c.status === 'Inactive').length;
    const quarterlyOnboards = clients.filter(c => {
      const onboardingDate = new Date(c.onboardingDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return onboardingDate >= threeMonthsAgo;
    }).length;

    return [
      { value: totalClients.toString(), label: "Total clients" },
      { value: quarterlyOnboards.toString(), label: "Quarterly onboards" },
      { value: activeClients.toString(), label: "Active clients" },
      { value: inactiveClients.toString(), label: "Inactive clients" },
    ];
  }, [clients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = 
        client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
      
      return matchesSearch && matchesStatus && matchesIndustry;
    });

    // Sort clients
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
  }, [clients, searchTerm, statusFilter, industryFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredAndSortedClients.slice(startIndex, endIndex);

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddClient = async (data: ClientFormData) => {
    try {
      const newClient = await clientApi.createClient(data);
      setClients([...clients, newClient]);
      toast.success('Client added successfully!');
    } catch (error) {
      console.error('Failed to add client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleEditClient = async (data: ClientFormData) => {
    if (!editingClient) return;
    
    try {
      const updatedClient = await clientApi.updateClient(editingClient.id, data);
      setClients(clients.map(c => c.id === editingClient.id ? updatedClient : c));
      setEditingClient(null);
      toast.success('Client updated successfully!');
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleClientClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {loading && (
        <div className="flex items-center justify-center w-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading clients...</span>
        </div>
      )}

      {/* Header with title and add button */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Clients
        </h1>

        <Button 
          className="bg-[#0b57d0] text-white gap-1"
          onClick={() => setShowClientForm(true)}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="font-medium text-sm [font-family:'IBM_Plex_Sans',Helvetica]">
            Add client
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
              placeholder="Search by client code, name, or email"
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients table */}
      <div className="w-full overflow-auto border border-[#e0e3ea] rounded">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center justify-between">
                Client code
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                Client name
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Email address
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center justify-between">
                Country
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('industry')}
              >
                <div className="flex items-center justify-between">
                Industry
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3 cursor-pointer hover:bg-[#d6d9de]"
                onClick={() => handleSort('projects')}
              >
                <div className="flex items-center justify-between">
                Projects
                  <ArrowUpDownIcon className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-6 whitespace-nowrap py-2.5 px-3">
                Account manager
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
            {currentClients.map((client, index) => (
              <TableRow
                key={`${client.code}-${index}`}
                className={index % 2 === 1 ? "bg-[#f6f7f9]" : ""}
              >
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {client.code}
                </TableCell>
                <TableCell 
                  className="py-3 px-3 font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 cursor-pointer hover:underline"
                  onClick={() => handleClientClick(client)}
                >
                  {client.name}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {client.email}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {client.country}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {client.industry}
                </TableCell>
                <TableCell className="py-3 px-3 font-normal text-[#172b4d] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                  {client.projects.toString()}
                </TableCell>
                <TableCell 
                  className="py-[7px] px-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/users/${client.manager.id}`)}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-[30px] w-[30px] rounded">
                      <img
                        src={client.manager.avatar}
                        alt={client.manager.name}
                        className="object-cover"
                      />
                    </Avatar>
                    <span className="font-medium text-[#0b57d0] text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5">
                      {client.manager.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-3">
                  <Badge
                    className={`font-normal text-[13px] [font-family:'IBM_Plex_Sans',Helvetica] leading-5 px-2 py-0.5 ${
                      client.status === "Active"
                        ? "bg-[#d4f9de] text-[#08872c]"
                        : "bg-[#ffe8dd] text-[#aa3f00]"
                    }`}
                  >
                    {client.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currentClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No clients found matching your criteria.
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
                <PaginationItem>
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

      {/* Client Form Modal */}
      <ClientForm
        open={showClientForm || !!editingClient}
        onOpenChange={(open) => {
          if (!open) {
            setShowClientForm(false);
            setEditingClient(null);
          }
        }}
        onSubmit={editingClient ? handleEditClient : handleAddClient}
        initialData={editingClient || undefined}
        mode={editingClient ? 'edit' : 'create'}
      />
    </section>
  );
};
