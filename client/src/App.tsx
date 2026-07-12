import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MapView } from './components/command-center/MapView';
import { KpiGrid } from './components/command-center/KpiGrid';
import { AlertFeed } from './components/command-center/AlertFeed';
import { TripStatusBoard } from './components/command-center/TripStatusBoard';
import { AnalyticsSummary } from './components/command-center/AnalyticsSummary';
import { DispatchBoard } from './components/panels/DispatchBoard';
import { WhatIfSimulator } from './components/panels/WhatIfSimulator';
import { DriverGamification } from './components/panels/DriverGamification';
import { CustomerPortal } from './components/panels/CustomerPortal';
import { MobileDriverApp } from './components/panels/MobileDriverApp';
import { AiDashboard } from './components/panels/AiDashboard';
import { FleetManagerPanel } from './components/panels/FleetManagerPanel';
import { DriverManagerPanel } from './components/panels/DriverManagerPanel';
import { MaintenancePanel } from './components/panels/MaintenancePanel';
import { FuelPanel } from './components/panels/FuelPanel';
import { ExpensePanel } from './components/panels/ExpensePanel';
import { ReportsPanel } from './components/panels/ReportsPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { AuditLogPanel } from './components/panels/AuditLogPanel';
import { AiCopilotDrawer } from './components/copilot/AiCopilotDrawer';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Main workspace content area (responds to sidebar width)
const WorkspaceArea: React.FC = () => {
  const { sidebarWidth } = useSidebar();
  const { activeTab } = useApp();

  return (
    <div
      className="flex-1 flex flex-col min-w-0"
      style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <Header />

      <main className="flex-1 p-6 pt-[76px] space-y-6 overflow-y-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <KpiGrid />
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                  <div className="xl:col-span-3">
                    <AlertFeed />
                  </div>
                  <div className="xl:col-span-6">
                    <MapView />
                  </div>
                  <div className="xl:col-span-3">
                    <AiCopilotDrawer inline={true} />
                  </div>
                </div>
                <TripStatusBoard />
                <AnalyticsSummary />
              </div>
            )}

            {activeTab === 'dispatch' && <DispatchBoard />}
            {activeTab === 'what-if' && <WhatIfSimulator />}
            {activeTab === 'gamification' && <DriverGamification />}
            {activeTab === 'customer' && <CustomerPortal />}
            {activeTab === 'driver-app' && <MobileDriverApp />}
            {activeTab === 'ai-dashboard' && <AiDashboard />}
            {activeTab === 'fleet' && <FleetManagerPanel />}
            {activeTab === 'drivers' && <DriverManagerPanel />}
            {activeTab === 'maintenance' && <MaintenancePanel />}
            {activeTab === 'fuel' && <FuelPanel />}
            {activeTab === 'expenses' && <ExpensePanel />}
            {activeTab === 'reports' && <ReportsPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'audit' && <AuditLogPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Copilot Drawer */}
      {activeTab !== 'dashboard' && <AiCopilotDrawer />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, loading, isAuthenticated, login } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 space-y-6 font-sans">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-xl border-2 border-indigo-500/20 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-bold text-slate-300 tracking-wide">TransitOps<span className="text-blue-400">+</span></p>
          <p className="text-xs font-medium text-slate-600">Synchronizing telemetry engines...</p>
        </div>
        <div className="w-48 space-y-2 mt-2">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full animate-pulse" style={{ width: '45%', animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (activeTab === 'login') {
      return (
        <LoginPage
          onLoginSuccess={(username) => login(username)}
          onBackToLanding={() => setActiveTab('landing')}
        />
      );
    }

    const handleLaunchPreset = (presetRole?: string, targetTab?: string) => {
      if (presetRole) {
        login(presetRole);
        if (targetTab) setActiveTab(targetTab);
      } else {
        setActiveTab('login');
      }
    };

    return <LandingPage onGetStarted={handleLaunchPreset} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
      <Sidebar />
      <WorkspaceArea />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <AppProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </AppProvider>
    </SocketProvider>
  );
};

export default App;
