import React from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function FilterBar({ filters, values, onChange, onReset }: FilterBarProps) {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      {filters.map((filter) => (
        <Select 
          key={filter.value} 
          value={values[filter.value] || 'all'} 
          onValueChange={(value) => onChange(filter.value, value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}s</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      <Button
        variant="ghost"
        onClick={onReset}
        className="text-[#0b57d0] hover:text-blue-700"
      >
        Reset filter
      </Button>
    </div>
  );
}