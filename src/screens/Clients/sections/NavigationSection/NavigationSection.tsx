import {
  BarChart2Icon,
  BellIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  HelpCircleIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";

// Navigation items data
const navigationItems = [
  {
    icon: <BarChart2Icon className="w-4 h-4" />,
    label: "Dashboard",
    path: "/",
    active: window.location.pathname === '/' || window.location.pathname === '/dashboard',
  },
  {
    icon: <CalendarIcon className="w-4 h-4" />,
    label: "Timesheet",
    path: "/timesheet",
    active: window.location.pathname.startsWith('/timesheet'),
  },
  {
    icon: <CheckSquareIcon className="w-4 h-4" />,
    label: "Tasks",
    path: "/tasks",
    active: window.location.pathname.startsWith('/tasks'),
  },
  {
    icon: <BriefcaseIcon className="w-4 h-4" />,
    label: "Projects",
    path: "/projects",
    active: window.location.pathname.startsWith('/projects'),
  },
  {
    icon: <UserCircleIcon className="w-4 h-4" />,
    label: "Clients",
    path: "/clients",
    active: window.location.pathname.startsWith('/clients'),
  },
  { 
    icon: <UsersIcon className="w-4 h-4" />, 
    label: "Users", 
    path: "/users",
    active: window.location.pathname.startsWith('/users')
  },
  {
    icon: <FileTextIcon className="w-4 h-4" />,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: <SettingsIcon className="w-4 h-4" />,
    label: "Settings",
    path: "/settings",
  },
];

// Bottom navigation items
const bottomNavItems = [
  {
    icon: <BellIcon className="w-4 h-4" />,
    label: "Notifications",
    path: "/notifications",
  },
  {
    icon: <HelpCircleIcon className="w-4 h-4" />,
    label: "Help",
    path: "/help",
  },
];

export const NavigationSection = (): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Function to check if a navigation item is active
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`min-h-screen ${isCollapsed ? 'w-[70px]' : 'w-[250px]'} bg-[#f0f1f5] border-r border-[#e6e9ee] flex flex-col transition-all duration-300 relative`}>
      {/* Company Logo and Name */}
      <div className={`p-4 mb-4 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <img
            className="w-[30px] h-[30px]"
            alt="Company Logo"
            src="/frame-2.svg"
          />
          {!isCollapsed && (
            <h1 className="font-bold text-2xl text-[#172b4d]">Company</h1>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-[11px] font-medium text-[#707585] ml-[47px]">
            Powered by 4x4advisory Tool
          </p>
        )}
      </div>

      {/* Toggle Button */}
      <div className={`absolute top-[67px] ${isCollapsed ? 'right-[-14px]' : 'right-[-14px]'} z-10`}>
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#707585] rounded-full w-7 h-7 p-0 hover:bg-[#5a5d6a] shadow-md"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-3 w-3 text-white" />
          ) : (
            <ChevronLeftIcon className="h-3 w-3 text-white" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-1' : 'px-2.5'} mt-5`}>
        <ul className="space-y-1">
          {navigationItems.map((item, index) => (
            <li key={index}>
              {isActiveRoute(item.path) ? (
                <Link
                  to={item.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 min-h-10 rounded bg-[#e0e3ea] text-[#172b4d] font-semibold text-sm`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 min-h-10 rounded hover:bg-[#e0e3ea] text-[#172b4d] font-normal text-sm`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className={`mt-auto ${isCollapsed ? 'px-1' : 'px-2.5'} pb-4 flex-shrink-0`}>
        {isCollapsed && (
          <div className="border-t border-[#e6e9ee] mb-2"></div>
        )}
        <ul className="space-y-1">
          {bottomNavItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 min-h-10 rounded hover:bg-[#e0e3ea] text-[#172b4d] font-normal text-sm`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="mt-2 pt-2 border-t border-[#e6e9ee]">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/rectangle-3.png" alt="User avatar" />
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-[#172b4d]">
                  Shakshi Sharma
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#707585]">ID# 1234567</span>
                  <Separator orientation="vertical" className="h-3.5" />
                  <button className="text-[#c20037] hover:underline">
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center gap-2.5 mt-2 pt-2 border-t border-[#e6e9ee]">
            <Avatar className="w-8 h-8 mx-auto">
              <AvatarImage src="/rectangle-3.png" alt="User avatar" />
              <AvatarFallback>SS</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  );
};
