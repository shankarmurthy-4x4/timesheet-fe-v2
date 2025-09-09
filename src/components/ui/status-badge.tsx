import React from 'react';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: string;
  type?: 'default' | 'priority' | 'billing';
}

export function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (type === 'default') {
      switch (status) {
        case 'Active':
          return 'bg-[#d4f9de] text-[#08872c]';
        case 'Inactive':
          return 'bg-[#ffe8dd] text-[#aa3f00]';
        case 'Completed':
          return 'bg-[#e6f3ff] text-[#0066cc]';
        case 'On Hold':
          return 'bg-[#fff3cd] text-[#856404]';
        case 'To Do':
          return 'bg-[#ffe8dd] text-[#aa3f00]';
        case 'In Progress':
        case 'In progress':
          return 'bg-[#e6f3ff] text-[#0066cc]';
        case 'Approved':
          return 'bg-[#d4f9de] text-[#08872c]';
        case 'Pending':
        case 'Pending for approval':
          return 'bg-[#fff3cd] text-[#856404]';
        case 'Rejected':
          return 'bg-[#ffe8dd] text-[#aa3f00]';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    if (type === 'priority') {
      switch (status) {
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
    }
    
    if (type === 'billing') {
      switch (status) {
        case 'Billable':
          return 'bg-[#d4f9de] text-[#08872c]';
        case 'Non-Billable':
          return 'bg-[#ffe8dd] text-[#aa3f00]';
        case 'Internal':
          return 'bg-[#e6f3ff] text-[#0066cc]';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={`font-normal text-[13px] px-2 py-0.5 ${getStatusColor()}`}>
      {status}
    </Badge>
  );
}