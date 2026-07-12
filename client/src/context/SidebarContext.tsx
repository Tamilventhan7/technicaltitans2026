import React, { createContext, useContext, useState } from 'react';

interface SidebarContextProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextProps>({
  collapsed: false,
  setCollapsed: () => {},
  sidebarWidth: 256
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 256;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
};
