import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Button } from './button';
import { SearchIcon, ArrowUpDownIcon } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  searchPlaceholder,
  onSearch,
  pagination,
  sorting,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSort = (field: string) => {
    if (sorting) {
      const newDirection = 
        sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
      sorting.onSort(field, newDirection);
    }
  };

  const totalPages = pagination 
    ? Math.ceil(pagination.totalItems / pagination.pageSize) 
    : 1;

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <div className="relative w-full md:w-[400px]">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-[#e6e9ee]">
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.accessorKey}
                  className={`font-medium text-[#172b4d] text-[13px] py-3 px-4 ${
                    column.sortable && sorting ? 'cursor-pointer hover:bg-[#d6d9de]' : ''
                  }`}
                  onClick={() => column.sortable && sorting && handleSort(column.accessorKey)}
                >
                  {column.sortable && sorting ? (
                    <div className="flex items-center justify-between">
                      {column.header}
                      <ArrowUpDownIcon className="h-4 w-4" />
                    </div>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={index}
                className={`${index % 2 === 1 ? "bg-[#f6f7f9]" : ""} ${
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                }`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.accessorKey} className="py-3 px-4">
                    {column.cell 
                      ? column.cell(item)
                      : (item as any)[column.accessorKey]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No records found
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total {pagination.totalItems} records
          </div>
          
          <div className="flex items-center gap-4">
            <Select 
              value={pagination.pageSize.toString()} 
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
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
                      if (pagination.pageIndex > 0) {
                        pagination.onPageChange(pagination.pageIndex);
                      }
                    }}
                    className={pagination.pageIndex === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.pageIndex < 3) {
                    pageNumber = i + 1;
                  } else if (pagination.pageIndex >= totalPages - 3) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.pageIndex - 1 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          pagination.onPageChange(pageNumber - 1);
                        }}
                        className={pageNumber === pagination.pageIndex + 1 ? "bg-[#172b4d] text-white" : ""}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && pagination.pageIndex < totalPages - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.pageIndex < totalPages - 1) {
                        pagination.onPageChange(pagination.pageIndex + 2);
                      }
                    }}
                    className={pagination.pageIndex === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}