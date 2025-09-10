import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { AdminDashboard } from "./screens/Dashboard/AdminDashboard";
import { EmployeeDashboard } from "./screens/Dashboard/EmployeeDashboard";
import { Clients } from "./screens/Clients/Clients";
import { ClientDetails } from "./screens/Clients/pages/ClientDetails";
import { Projects } from "./screens/Projects/Projects";
import { ProjectDetails } from "./screens/Projects/pages/ProjectDetails";
import { Tasks } from "./screens/Tasks/Tasks";
import { TaskDetails } from "./screens/Tasks/pages/TaskDetails";
import { Users } from "./screens/Users/Users";
import { UserDetails } from "./screens/Users/pages/UserDetails";
import { Timesheet } from "./screens/Timesheet/Timesheet";
import { TimesheetDetails } from "./screens/Timesheet/pages/TimesheetDetails";
import { Reports } from "./screens/Reports/Reports";
import { Settings } from "./screens/Settings/Settings";
import { Toast } from "./components/ui/toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    ),
  },
  {
    path: "/dashboard/admin",
    element: (
      <MainLayout>
        <AdminDashboard />
      </MainLayout>
    ),
  },
  {
    path: "/dashboard/employee",
    element: (
      <MainLayout>
        <EmployeeDashboard />
      </MainLayout>
    ),
  },
  {
    path: "/clients",
    element: (
      <MainLayout>
        <Clients />
      </MainLayout>
    ),
  },
  {
    path: "/clients/:id",
    element: (
      <MainLayout>
        <ClientDetails />
      </MainLayout>
    ),
  },
  {
    path: "/projects",
    element: (
      <MainLayout>
        <Projects />
      </MainLayout>
    ),
  },
  {
    path: "/projects/:id",
    element: (
      <MainLayout>
        <ProjectDetails />
      </MainLayout>
    ),
  },
  {
    path: "/tasks",
    element: (
      <MainLayout>
        <Tasks />
      </MainLayout>
    ),
  },
  {
    path: "/tasks/:id",
    element: (
      <MainLayout>
        <TaskDetails />
      </MainLayout>
    ),
  },
  {
    path: "/users",
    element: (
      <MainLayout>
        <Users />
      </MainLayout>
    ),
  },
  {
    path: "/users/:id",
    element: (
      <MainLayout>
        <UserDetails />
      </MainLayout>
    ),
  },
  {
    path: "/timesheet",
    element: (
      <MainLayout>
        <Timesheet />
      </MainLayout>
    ),
  },
  {
    path: "/timesheet/:userId",
    element: (
      <MainLayout>
        <TimesheetDetails />
      </MainLayout>
    ),
  },
  {
    path: "/reports",
    element: (
      <MainLayout>
        <Reports />
      </MainLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <MainLayout>
        <Settings />
      </MainLayout>
    ),
  },
]);

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
};
