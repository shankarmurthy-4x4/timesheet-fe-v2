// Base API service with common functionality
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export class BaseApiService<T extends BaseEntity> {
  protected storageKey: string;
  protected mockData: T[];
  
  constructor(storageKey: string, mockData: T[]) {
    this.storageKey = storageKey;
    this.mockData = mockData;
  }
  
  // Get stored data or use mock data
  protected getStoredData(): T[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.mockData;
    } catch {
      return this.mockData;
    }
  }
  
  // Save data to localStorage
  protected saveData(data: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save data to ${this.storageKey}:`, error);
    }
  }
  
  // Get all items with optional pagination and filtering
  async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
    await delay(300);
    let data = this.getStoredData();
    
    // Apply search if provided
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      data = data.filter(item => 
        Object.values(item).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Apply filters if provided
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== 'all' && value !== undefined) {
          data = data.filter(item => {
            const itemValue = this.getNestedProperty(item, key);
            return itemValue === value;
          });
        }
      });
    }
    
    // Apply date range if provided
    if (params?.dateRange?.from && params?.dateRange?.to) {
      const fromDate = new Date(params.dateRange.from).getTime();
      const toDate = new Date(params.dateRange.to).getTime();
      
      data = data.filter(item => {
        // Check if item has a date field (createdAt, date, startDate, etc.)
        const dateField = this.getDateField(item);
        if (!dateField) return true;
        
        const itemDate = new Date(item[dateField as keyof T] as string).getTime();
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    
    // Apply sorting if provided
    if (params?.sortBy) {
      const sortField = params.sortBy;
      const sortDirection = params.sortDirection || 'asc';
      
      data.sort((a, b) => {
        const aValue = this.getNestedProperty(a, sortField);
        const bValue = this.getNestedProperty(b, sortField);
        
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
    }
    
    // Apply pagination if provided
    const page = params?.page || 1;
    const pageSize = params?.pageSize || data.length;
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    
    if (pageSize < total) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      data = data.slice(start, end);
    }
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }
  
  // Get item by ID
  async getById(id: string): Promise<T | null> {
    await delay(200);
    const data = this.getStoredData();
    return data.find(item => item.id === id) || null;
  }
  
  // Create new item
  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    await delay(400);
    const data = this.getStoredData();
    
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;
    
    const updatedData = [...data, newItem];
    this.saveData(updatedData);
    
    return newItem;
  }
  
  // Update item
  async update(id: string, updates: Partial<T>): Promise<T> {
    await delay(300);
    const data = this.getStoredData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    data[index] = updatedItem;
    this.saveData(data);
    
    return updatedItem;
  }
  
  // Delete item
  async delete(id: string): Promise<void> {
    await delay(300);
    const data = this.getStoredData();
    const filteredData = data.filter(item => item.id !== id);
    this.saveData(filteredData);
  }
  
  // Helper method to get nested property value
  private getNestedProperty(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }
    
    return value;
  }
  
  // Helper method to find a date field in an item
  private getDateField(item: T): string | null {
    const dateFields = ['createdAt', 'updatedAt', 'date', 'startDate', 'dueDate', 'onboardingDate'];
    
    for (const field of dateFields) {
      if (field in item) {
        return field;
      }
    }
    
    return null;
  }
}