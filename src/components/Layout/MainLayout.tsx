import React from 'react';
import { NavigationSection } from '../../screens/Clients/sections/NavigationSection';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <NavigationSection />
      <main className="flex-1 pl-6">
        {children}
      </main>
    </div>
  );
};