import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketProvider } from './context/SocketContext';
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
import { AiCopilotDrawer } from './components/copilot/AiCopilotDrawer';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, loading, isAuthenticated, login } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 space-y-4 font-sans">
        <div className="w-12 h-12 rounded-xl border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Synchronizing TransitOps+ telemetry engines...</p>
      </div>
    );
  }

  // Not authenticated routing
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
        if (targetTab) {
          setActiveTab(targetTab);
        }
      } else {
        setActiveTab('login');
      }
    };

    return <LandingPage onGetStarted={handleLaunchPreset} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        <Header />

        {/* Dynamic Workspace Panel with Animations */}
        <main className="flex-1 p-8 pt-28 space-y-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Fleet KPIs on Top */}
                  <KpiGrid />

                  {/* Middle Section: Alerts (Left), Map (Center), Assistant (Right) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
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

                  {/* Trips Below */}
                  <TripStatusBoard />

                  {/* Charts at Bottom */}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Copilot Drawer - Only when NOT in the main dashboard view */}
      {activeTab !== 'dashboard' && <AiCopilotDrawer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SocketProvider>
  );
};

export default App;
