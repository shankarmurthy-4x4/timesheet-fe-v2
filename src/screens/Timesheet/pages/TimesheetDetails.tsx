import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, HomeIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '../../../components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { timesheetApi } from '../../../services/timesheetApi';
import { TimesheetEntry } from '../../../types/timesheet';
import toast from 'react-hot-toast';
import { taskApi } from '../../../services/taskApi';
import { TaskProject, TaskUser } from '../../../types/task';

export const TimesheetDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Early return if userId is not available to ensure consistent hook rendering
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid user ID</h1>
        <Button onClick={() => navigate('/timesheet')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Timesheet
        </Button>
      </div>
    );
  }

  // All hooks are now guaranteed to be called in the same order every render
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [editingCell, setEditingCell] = useState<{ entryId: string; day: string } | null>(null);

  // Load user timesheets
  React.useEffect(() => {
    const loadTimesheets = async () => {
      try {
        setLoading(true);
        const [userTimesheets, projectsData, usersData] = await Promise.all([
          timesheetApi.getTimesheetsByUserId(userId),
          taskApi.getProjects(),
          taskApi.getUsers(),
        ]);
        setTimesheets(userTimesheets);
        setProjects(projectsData);
        setUsers(usersData);
        if (userTimesheets.length > 0) {
          setSelectedTimesheet(userTimesheets[0]);
        }
      } catch (error) {
        console.error('Failed to load timesheets:', error);
        toast.error('Failed to load timesheet details');
      } finally {
        setLoading(false);
      }
    };

    loadTimesheets();
  }, [userId]);

  // Generate week days for the timesheet
  const getWeekDays = React.useCallback(() => {
    if (!selectedTimesheet) return [];
    
    const startDate = new Date(selectedTimesheet.dateRange.startDate);
    const days = [];
    
    // Start from Monday and go through Sunday (7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.getMonth() + 1,
      });
    }
    
    return days;
  }, [selectedTimesheet]);

  // Group entries by project/activity/task combination
  const groupedEntries = React.useMemo(() => {
    if (!selectedTimesheet) return [];
    
    const groups = new Map();
    
    selectedTimesheet.entries.forEach(entry => {
      const key = `${entry.projectId}-${entry.activityId}-${entry.taskId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          projectId: entry.projectId,
          projectCode: entry.projectCode,
          projectName: entry.projectName,
          activityId: entry.activityId,
          activityName: entry.activityName,
          taskId: entry.taskId,
          taskName: entry.taskName,
          billable: entry.billable,
          entries: new Map(),
        });
      }
      
      const group = groups.get(key);
      group.entries.set(entry.date, entry);
    });
    
    return Array.from(groups.values());
  }, [selectedTimesheet]);

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading timesheet details...</p>
      </div>
    );
  }

  if (!selectedTimesheet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No timesheets found</h1>
        <Button onClick={() => navigate('/timesheet')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Timesheet
        </Button>
      </div>
    );
  }

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    try {
      await timesheetApi.updateTimesheetStatus({
        timesheetIds: [selectedTimesheet.id],
        action,
        comment: action === 'approve' ? 'Timesheet approved' : 'Please review and resubmit',
      });
      
      // Reload timesheets
      const userTimesheets = await timesheetApi.getTimesheetsByUserId(userId);
      setTimesheets(userTimesheets);
      const updatedTimesheet = userTimesheets.find(t => t.id === selectedTimesheet.id);
      if (updatedTimesheet) {
        setSelectedTimesheet(updatedTimesheet);
      }
      
      toast.success(`Timesheet ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} timesheet:`, error);
      toast.error(`Failed to ${action} timesheet`);
    }
  };

  const handleCellEdit = (entryId: string, day: string, value: string) => {
    const hours = parseFloat(value) || 0;
    if (hours < 0 || hours > 24) return;
    
    // Update the timesheet entry
    const updatedTimesheet = { ...selectedTimesheet };
    const entryIndex = updatedTimesheet.entries.findIndex(entry => 
      entry.date === day && `${entry.projectId}-${entry.activityId}-${entry.taskId}` === entryId.split('-').slice(0, 3).join('-')
    );
    
    if (entryIndex !== -1) {
      updatedTimesheet.entries[entryIndex].hours = hours;
      updatedTimesheet.totalHours = updatedTimesheet.entries.reduce((sum, entry) => sum + entry.hours, 0);
      setSelectedTimesheet(updatedTimesheet);
      
      // Update in the timesheets array
      setTimesheets(prev => prev.map(t => t.id === updatedTimesheet.id ? updatedTimesheet : t));
      toast.success('Hours updated successfully');
    }
  };

  const handleDropdownChange = (groupIndex: number, field: string, value: string) => {
    const group = groupedEntries[groupIndex];
    if (!group) return;
    
    // Update the timesheet entries for this group
    const updatedTimesheet = { ...selectedTimesheet };
    
    if (field === 'project') {
      const selectedProject = projects.find(p => p.code === value);
      if (selectedProject) {
        updatedTimesheet.entries = updatedTimesheet.entries.map(entry => {
          if (`${entry.projectId}-${entry.activityId}-${entry.taskId}` === `${group.projectId}-${group.activityId}-${group.taskId}`) {
            return {
              ...entry,
              projectId: selectedProject.id,
              projectCode: selectedProject.code,
              projectName: selectedProject.name,
            };
          }
          return entry;
        });
      }
    }
    
    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(prev => prev.map(t => t.id === updatedTimesheet.id ? updatedTimesheet : t));
    toast.success(`${field} updated successfully`);
  };

  const handleBillableChange = (groupIndex: number, billable: boolean) => {
    const group = groupedEntries[groupIndex];
    if (!group) return;
    
    // Update the timesheet entries for this group
    const updatedTimesheet = { ...selectedTimesheet };
    updatedTimesheet.entries = updatedTimesheet.entries.map(entry => {
      if (`${entry.projectId}-${entry.activityId}-${entry.taskId}` === `${group.projectId}-${group.activityId}-${group.taskId}`) {
        return { ...entry, billable };
      }
      return entry;
    });
    
    setSelectedTimesheet(updatedTimesheet);
    setTimesheets(prev => prev.map(t => t.id === updatedTimesheet.id ? updatedTimesheet : t));
    toast.success(`Billable status updated`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/timesheet')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/dashboard" 
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/dashboard');
                    }}
                  >
                    <HomeIcon className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/timesheet" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/timesheet');
                    }}
                  >
                    Timesheet
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">
                    {selectedTimesheet.userName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      {/* User Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src={selectedTimesheet.userAvatar} 
                alt={selectedTimesheet.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTimesheet.userName}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={`text-xs ${getStatusColor(selectedTimesheet.status)}`}>
                    {selectedTimesheet.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Date range</span>
                  <Select value={`${selectedTimesheet.dateRange.startDate} - ${selectedTimesheet.dateRange.endDate}`}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timesheets.map((timesheet) => (
                        <SelectItem 
                          key={timesheet.id} 
                          value={`${timesheet.dateRange.startDate} - ${timesheet.dateRange.endDate}`}
                        >
                          <div onClick={() => setSelectedTimesheet(timesheet)}>
                            {formatDate(timesheet.dateRange.startDate)} - {formatDate(timesheet.dateRange.endDate)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {selectedTimesheet.status === 'Pending' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleApproveReject('reject')}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XIcon className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApproveReject('approve')}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="flex-1 px-6 py-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#e6e9ee]">
                  <TableRow>
                    <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 min-w-[200px]">
                      Project name
                    </TableHead>
                    <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 min-w-[150px]">
                      Activity
                    </TableHead>
                    <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 min-w-[200px]">
                      Task name
                    </TableHead>
                    <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 text-center">
                      Billable
                    </TableHead>
                    {weekDays.map((day) => (
                      <TableHead key={day.date} className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 text-center min-w-[80px]">
                        <div>
                          <div>{day.dayName}</div>
                          <div>{day.dayNumber}/{day.month}</div>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="font-medium text-[#172b4d] text-[13px] py-2.5 px-3 text-center">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedEntries.map((group, groupIndex) => {
                    const rowTotal = weekDays.reduce((sum, day) => {
                      const dayEntry = group.entries.get(day.date);
                      return sum + (dayEntry ? dayEntry.hours : 0);
                    }, 0);
                    
                    return (
                    <TableRow key={`${group.projectId}-${group.activityId}-${group.taskId}`} className={groupIndex % 2 === 1 ? "bg-[#f6f7f9]" : ""}>
                      <TableCell className="py-3 px-3">
                        <Select 
                          value={group.projectCode}
                          onValueChange={(value) => handleDropdownChange(groupIndex, 'project', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.code}>
                                <div>
                                  <div className="font-medium">{project.code}</div>
                                  <div className="text-xs text-gray-500">{project.name}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <Select 
                          value={group.activityName}
                          onValueChange={(value) => handleDropdownChange(groupIndex, 'activity', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects
                              .find(p => p.code === group.projectCode)
                              ?.activities.map((activity) => (
                                <SelectItem key={activity.id} value={activity.name}>
                                  {activity.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-3 px-3">
                        <Select 
                          value={group.taskName}
                          onValueChange={(value) => handleDropdownChange(groupIndex, 'task', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select task" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={group.taskName}>
                              {group.taskName}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={group.billable}
                          onChange={(e) => handleBillableChange(groupIndex, e.target.checked)}
                          className="w-4 h-4"
                        />
                      </TableCell>
                      {weekDays.map((day) => {
                        const dayEntry = group.entries.get(day.date);
                        const cellKey = `${group.projectId}-${group.activityId}-${group.taskId}-${day.date}`;
                        const isEditing = editingCell?.entryId === cellKey;
                        
                        return (
                          <TableCell key={day.date} className="py-3 px-3 text-center">
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                defaultValue={dayEntry ? dayEntry.hours.toString() : '0'}
                                className="w-16 h-8 text-center text-xs"
                                onBlur={(e) => {
                                  handleCellEdit(cellKey, day.date, e.target.value);
                                  setEditingCell(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellEdit(cellKey, day.date, e.currentTarget.value);
                                    setEditingCell(null);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <div 
                                className="w-16 mx-auto cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                                onClick={() => setEditingCell({ entryId: cellKey, day: day.date })}
                              >
                                {dayEntry ? dayEntry.hours.toFixed(1) : '0.0'}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="py-3 px-3 text-center font-medium">
                        {rowTotal.toFixed(1)}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                  
                  {/* Total Row */}
                  <TableRow className="bg-gray-50 font-medium">
                    <TableCell colSpan={4} className="py-3 px-3 text-right">
                      Total
                    </TableCell>
                    {weekDays.map((day) => {
                      const dayTotal = groupedEntries.reduce((sum, group) => {
                        const dayEntry = group.entries.get(day.date);
                        return sum + (dayEntry ? dayEntry.hours : 0);
                      }, 0);
                      return (
                        <TableCell key={day.date} className="py-3 px-3 text-center font-medium">
                          {dayTotal.toFixed(1)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="py-3 px-3 text-center font-bold">
                      {groupedEntries.reduce((sum, group) => {
                        return sum + weekDays.reduce((daySum, day) => {
                          const dayEntry = group.entries.get(day.date);
                          return daySum + (dayEntry ? dayEntry.hours : 0);
                        }, 0);
                      }, 0).toFixed(1)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity log</h3>
            <div className="space-y-4">
              {selectedTimesheet.activityLog.map((activity) => (
                <div key={activity.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {activity.type === 'submitted' && (
                      <div>
                        <div className="text-sm text-gray-600">Submitted date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(activity.date)}
                        </div>
                      </div>
                    )}
                    
                    {activity.type === 'approved' && (
                      <>
                        <div>
                          <div className="text-sm text-gray-600">Approved by</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <img src={activity.performedBy.avatar} alt={activity.performedBy.name} />
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.performedBy.name}</div>
                              <div className="text-xs text-gray-500">{activity.performedBy.email}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Approved date</div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateTime(activity.date)}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {activity.type === 'rejected' && (
                      <>
                        <div>
                          <div className="text-sm text-gray-600">Rejected by</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <img src={activity.performedBy.avatar} alt={activity.performedBy.name} />
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{activity.performedBy.name}</div>
                              <div className="text-xs text-gray-500">{activity.performedBy.email}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Rejected date</div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateTime(activity.date)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {activity.comment && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Comment:</span> {activity.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};