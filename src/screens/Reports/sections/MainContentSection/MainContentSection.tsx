import React, { useState } from "react";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { TimesheetReportTab } from "../../components/TimesheetReportTab";
import { UserReportTab } from "../../components/UserReportTab";
import { ClientReportTab } from "../../components/ClientReportTab";
import { ProjectReportTab } from "../../components/ProjectReportTab";
import { TaskReportTab } from "../../components/TaskReportTab";
import { dateRangeOptions } from "../../../../data/mockReports";
import { ReportFilter } from "../../../../types/reports";
import toast from "react-hot-toast";

type ReportTab = 'timesheet' | 'task' | 'project' | 'client' | 'user';

export const MainContentSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<ReportTab>('timesheet');
  const [dateRange, setDateRange] = useState<ReportFilter['dateRange']>('thisMonth');

  const handleDownloadReport = async () => {
    try {
      toast.success('Report download started...');
      // Simulate download
      setTimeout(() => {
        toast.success('Report downloaded successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getTabTitle = (tab: ReportTab) => {
    switch (tab) {
      case 'timesheet':
        return 'Timesheet Report';
      case 'task':
        return 'Task report';
      case 'project':
        return 'Project report';
      case 'client':
        return 'Client report';
      case 'user':
        return 'User report';
      default:
        return 'Report';
    }
  };

  return (
    <section className="flex flex-col items-start gap-6 py-6 pr-6 flex-1 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between w-full">
        <h1 className="font-pagetitle-semibold font-bold text-[#172b4d] text-[length:var(--pagetitle-semibold-font-size)] tracking-[var(--pagetitle-semibold-letter-spacing)] leading-[var(--pagetitle-semibold-line-height)]">
          Reports
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as ReportFilter['dateRange'])}>
              <SelectTrigger className="w-[200px] h-10">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-0 w-full border-b border-gray-200">
        {(['timesheet', 'task', 'project', 'client', 'user'] as ReportTab[]).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-none border-b-2 px-6 py-3 ${
              activeTab === tab 
                ? 'border-[#172b4d] bg-[#172b4d] text-white' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {getTabTitle(tab)}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full flex-1">
        {activeTab === 'timesheet' && (
          <TimesheetReportTab 
            dateRange={dateRange}
            onDownload={handleDownloadReport}
          />
        )}
        {activeTab === 'task' && (
          <TaskReportTab 
            dateRange={dateRange}
            onDownload={handleDownloadReport}
          />
        )}
        {activeTab === 'project' && (
          <ProjectReportTab 
            dateRange={dateRange}
            onDownload={handleDownloadReport}
          />
        )}
        {activeTab === 'client' && (
          <ClientReportTab 
            dateRange={dateRange}
            onDownload={handleDownloadReport}
          />
        )}
        {activeTab === 'user' && (
          <UserReportTab 
            dateRange={dateRange}
            onDownload={handleDownloadReport}
          />
        )}
      </div>
    </section>
  );
};