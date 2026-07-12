import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { Vehicle, Driver, Warehouse, Alert, Trip, SimulationKpis } from '../types';

interface AppContextProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  warehouses: Warehouse[];
  alerts: Alert[];
  trips: Trip[];
  kpis: SimulationKpis | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  loading: boolean;
  
  // Auth state
  isAuthenticated: boolean;
  user: { id: string; username: string; role: string; name: string; email: string; phone?: string; department?: string } | null;
  role: 'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst';
  setRole: (role: 'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst') => void;
  login: (username: string) => Promise<void>;
  logout: () => void;
  
  // Dispatch & simulation triggers
  dispatchTrip: (data: {
    originId: string;
    destinationId: string;
    vehicleId: string;
    driverId: string;
    cargoType: string;
    cargoWeightKG: number;
  }) => Promise<Trip>;
  submitPod: (data: {
    tripId: string;
    signature: string;
    photoUrl: string;
    receivedBy: string;
    odometer: number;
  }) => Promise<Trip>;
  injectIncident: (tripId: string, category: string) => Promise<void>;
  setSimulationSpeed: (multiplier: number) => Promise<void>;
  resetDatabase: () => Promise<void>;
  refreshTrips: () => Promise<void>;

  // Asset registries mutations
  createVehicle: (data: { id: string; type: string; plateNumber: string; odometer: number }) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  createDriver: (data: { id: string; name: string; licenseNumber: string; phone: string; email: string }) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;

  // i18n Translations
  language: 'en' | 'hi' | 'ta';
  setLanguage: (lang: 'en' | 'hi' | 'ta') => void;
  t: (key: string) => string;

  // Color themes
  theme: 'indigo' | 'saffron' | 'tricolor' | 'royal';
  setTheme: (theme: 'indigo' | 'saffron' | 'tricolor' | 'royal') => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useSocket();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [kpis, setKpis] = useState<SimulationKpis | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst'>('Admin');

  // i18n translations
  const [language, setLanguage] = useState<'en' | 'hi' | 'ta'>('en');

  // Color theme
  const [theme, setThemeState] = useState<'indigo' | 'saffron' | 'tricolor' | 'royal'>(() => {
    return (localStorage.getItem('transitops-theme') as any) || 'indigo';
  });

  const setTheme = (newTheme: 'indigo' | 'saffron' | 'tricolor' | 'royal') => {
    setThemeState(newTheme);
    localStorage.setItem('transitops-theme', newTheme);
  };

  useEffect(() => {
    document.body.classList.remove('theme-indigo', 'theme-saffron', 'theme-tricolor', 'theme-royal');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const translations: Record<'en' | 'hi' | 'ta', Record<string, string>> = {
    en: {
      commandCenter: 'Command Center',
      aiDashboard: 'AI Dashboard',
      fleetRegister: 'Fleet Register',
      driversShift: 'Drivers Shift Roster',
      smartDispatch: 'Smart Dispatch',
      maintenanceLog: 'Maintenance Log',
      fuelLedger: 'Fuel Ledger',
      expensesAudit: 'Expenses Audit',
      whatIf: 'What-If Simulator',
      driverStandings: 'Driver Standings',
      reportsHub: 'Reports Hub',
      customerSupport: 'Customer Support',
      settingsControl: 'Settings Control',
      driverPortal: 'Driver Dispatch Portal',
      auditLogs: 'System Audit Logs',
    },
    hi: {
      commandCenter: 'कमांड सेंटर',
      aiDashboard: 'एआई डैशबोर्ड',
      fleetRegister: 'बेड़ा रजिस्टर',
      driversShift: 'चालक शिफ्ट रोस्टर',
      smartDispatch: 'स्मार्ट प्रेषण',
      maintenanceLog: 'रखरखाव लॉग',
      fuelLedger: 'ईंधन बही',
      expensesAudit: 'व्यय लेखापरीक्षा',
      whatIf: 'व्हाट-इफ सिम्युलेटर',
      driverStandings: 'चालक रैंकिंग',
      reportsHub: 'रिपोर्ट हब',
      customerSupport: 'ग्राहक सहायता',
      settingsControl: 'सेटिंग्स नियंत्रण',
      driverPortal: 'चालक प्रेषण पोर्टल',
      auditLogs: 'सिस्टम ऑडिट लॉग',
    },
    ta: {
      commandCenter: 'கட்டளை மையம்',
      aiDashboard: 'செயற்கை அறிவு முகப்பு',
      fleetRegister: 'வண்டி பதிவேடு',
      driversShift: 'ஓட்டுநர் பட்டியல்',
      smartDispatch: 'ஸ்மார்ட் அனுப்புகை',
      maintenanceLog: 'பராமரிப்பு பதிவேடு',
      fuelLedger: 'எரிபொருள் கணக்கு',
      expensesAudit: 'செலவு தணிக்கை',
      whatIf: 'வாட்-இஃப் சிமுலேட்டர்',
      driverStandings: 'ஓட்டுநர் தரவரிசை',
      reportsHub: 'அறிக்கை மையம்',
      customerSupport: 'வாடிக்கையாளர் ஆதரவு',
      settingsControl: 'அமைப்புகள் கட்டுப்பாடு',
      driverPortal: 'ஓட்டுநர் அனுப்புகை போர்ட்டல்',
      auditLogs: 'முறைமை தணிக்கை பதிவுகள்',
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, wRes, tRes] = await Promise.all([
        fetch(`${backendUrl}/api/vehicles`),
        fetch(`${backendUrl}/api/drivers`),
        fetch(`${backendUrl}/api/warehouses`), 
        fetch(`${backendUrl}/api/trips`)
      ]);

      const vData = await vRes.json();
      const dData = await dRes.json();
      const wData = wRes.ok ? await wRes.json() : [];
      const tData = await tRes.json();

      setVehicles(vData);
      setDrivers(dData);
      if (wRes.ok) setWarehouses(wData);
      setTrips(tData);
    } catch (err) {
      console.error('Error fetching initial fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to WebSocket ticks
  useEffect(() => {
    if (!socket) return;

    socket.on('sim-tick', (data: {
      vehicles: Vehicle[];
      drivers: Driver[];
      trips: Trip[];
      alerts: Alert[];
      kpis: SimulationKpis;
    }) => {
      setVehicles(data.vehicles);
      setDrivers(data.drivers);
      setAlerts(data.alerts);
      setKpis(data.kpis);
      
      setTrips(prevTrips => {
        const updated = [...prevTrips];
        data.trips.forEach(activeT => {
          const idx = updated.findIndex(t => t.id === activeT.id);
          if (idx > -1) updated[idx] = activeT;
          else updated.push(activeT);
        });
        return updated;
      });
    });

    socket.on('alert-triggered', (alert: Alert) => {
      setAlerts(prev => {
        if (prev.some(a => a.id === alert.id)) return prev;
        return [alert, ...prev];
      });
    });

    socket.on('trip-dispatched', (newTrip: Trip) => {
      setTrips(prev => [newTrip, ...prev]);
    });

    socket.on('trip-completed', (completedTrip: Trip) => {
      setTrips(prev => prev.map(t => t.id === completedTrip.id ? completedTrip : t));
    });

    return () => {
      socket.off('sim-tick');
      socket.off('alert-triggered');
      socket.off('trip-dispatched');
      socket.off('trip-completed');
    };
  }, [socket]);

  // Auth Operations
  const login = async (username: string): Promise<void> => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'password' })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        setRole(data.user.role);
        setActiveTab('dashboard');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.warn('Backend login unavailable. Activating client fallback session.');
      const mockRoles: Record<string, 'Admin' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst' | 'FleetManager'> = {
        admin: 'Admin',
        dispatcher: 'Dispatcher',
        driver: 'Driver',
        safety: 'SafetyOfficer',
        finance: 'FinancialAnalyst',
        manager: 'FleetManager'
      };
      const resolvedRole = mockRoles[username.toLowerCase()] || 'Admin';
      setIsAuthenticated(true);
      setUser({
        id: 'EMP-MOCK',
        username: username,
        role: resolvedRole,
        name: username.charAt(0).toUpperCase() + username.slice(1) + ' (Demo)',
        email: `${username}@transitops.com`
      });
      setRole(resolvedRole as any);
      setActiveTab('dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('landing');
  };

  const dispatchTrip = async (data: {
    originId: string;
    destinationId: string;
    vehicleId: string;
    driverId: string;
    cargoType: string;
    cargoWeightKG: number;
  }): Promise<Trip> => {
    const res = await fetch(`${backendUrl}/api/trips/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to dispatch trip');
    }
    const apiRes = await res.json();
    const trip = apiRes.data;
    
    setTrips(prev => [trip, ...prev]);
    fetchData(); 
    return trip;
  };

  const submitPod = async (data: {
    tripId: string;
    signature: string;
    photoUrl: string;
    receivedBy: string;
    odometer: number;
  }): Promise<Trip> => {
    const res = await fetch(`${backendUrl}/api/trips/pod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit POD');
    }
    const apiRes = await res.json();
    const trip = apiRes.data;
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
    fetchData(); 
    return trip;
  };

  const injectIncident = async (tripId: string, category: string): Promise<void> => {
    await fetch(`${backendUrl}/api/trips/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, category })
    });
  };

  const setSimulationSpeed = async (multiplier: number): Promise<void> => {
    await fetch(`${backendUrl}/api/system/simulation-speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier })
    });
  };

  const resetDatabase = async (): Promise<void> => {
    await fetch(`${backendUrl}/api/system/reset`, { method: 'POST' });
    await fetchData();
  };

  const refreshTrips = async (): Promise<void> => {
    const res = await fetch(`${backendUrl}/api/trips`);
    const data = await res.json();
    setTrips(data);
  };

  // Asset creation and deletion handlers
  const createVehicle = async (data: { id: string; type: string; plateNumber: string; odometer: number }): Promise<void> => {
    const res = await fetch(`${backendUrl}/api/vehicles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-admin'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to register vehicle asset.');
    }
    await fetchData();
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    const res = await fetch(`${backendUrl}/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer mock-jwt-token-admin' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to retire vehicle.');
    }
    await fetchData();
  };

  const createDriver = async (data: { id: string; name: string; licenseNumber: string; phone: string; email: string }): Promise<void> => {
    const res = await fetch(`${backendUrl}/api/drivers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-jwt-token-admin'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to register driver profile.');
    }
    await fetchData();
  };

  const deleteDriver = async (id: string): Promise<void> => {
    const res = await fetch(`${backendUrl}/api/drivers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer mock-jwt-token-admin' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete driver.');
    }
    await fetchData();
  };

  return (
    <AppContext.Provider value={{
      vehicles,
      drivers,
      warehouses,
      alerts,
      trips,
      kpis,
      activeTab,
      setActiveTab,
      selectedVehicleId,
      setSelectedVehicleId,
      loading,
      isAuthenticated,
      user,
      role,
      setRole,
      login,
      logout,
      dispatchTrip,
      submitPod,
      injectIncident,
      setSimulationSpeed,
      resetDatabase,
      refreshTrips,
      createVehicle,
      deleteVehicle,
      createDriver,
      deleteDriver,
      language,
      setLanguage,
      t,
      theme,
      setTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};
