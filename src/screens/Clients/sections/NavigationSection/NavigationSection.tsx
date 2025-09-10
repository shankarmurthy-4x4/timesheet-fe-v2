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
    subItems: [
      { label: "Dashboard", path: "/" },
      { label: "Dashboard - Admin", path: "/dashboard/admin" },
      { label: "Dashboard - Employee", path: "/dashboard/employee" },
    ],
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  // Function to check if a navigation item is active
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard');
    }
    return location.pathname.startsWith(path);
  };

  // Function to toggle expanded state for items with subItems
  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Check if any sub-item is active
  const hasActiveSubItem = (subItems: any[]) => {
    return subItems.some(subItem => isActiveRoute(subItem.path));
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
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => !isCollapsed && toggleExpanded(item.label)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 min-h-10 rounded ${
                      hasActiveSubItem(item.subItems) ? 'bg-[#e0e3ea] text-[#172b4d] font-semibold' : 'hover:bg-[#e0e3ea] text-[#172b4d] font-normal'
                    } text-sm`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className={`transition-transform ${expandedItems.includes(item.label) ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </>
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.label) && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={`block px-3 py-2 text-sm rounded ${
                              isActiveRoute(subItem.path) 
                                ? 'bg-[#d0d4db] text-[#172b4d] font-semibold' 
                                : 'text-[#172b4d] hover:bg-[#e0e3ea]'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                isActiveRoute(item.path) ? (
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
                )
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
