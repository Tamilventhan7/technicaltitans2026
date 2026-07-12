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
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, wRes, tRes] = await Promise.all([
        fetch(`${backendUrl}/api/fleet/vehicles`),
        fetch(`${backendUrl}/api/fleet/drivers`),
        fetch(`${backendUrl}/api/fleet/warehouses`),
        fetch(`${backendUrl}/api/trips`)
      ]);

      const [vData, dData, wData, tData] = await Promise.all([
        vRes.json(),
        dRes.json(),
        wRes.json(),
        tRes.json()
      ]);

      setVehicles(vData);
      setDrivers(dData);
      setWarehouses(wData);
      setTrips(tData);

      // Extract basic alerts
      const activeAlerts = tData.reduce((acc: Alert[], t: Trip) => {
        return acc; // alerts are driven from socket or API separately if needed
      }, []);
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
      
      // Merge active simulated trips into overall trips list
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
      throw new Error(err.error || 'Failed to dispatch trip');
    }
    const trip = await res.json();
    
    // Update local immediately
    setTrips(prev => [trip, ...prev]);
    fetchData(); // reload statuses
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
      throw new Error(err.error || 'Failed to submit POD');
    }
    const trip = await res.json();
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
    fetchData(); // reload statuses
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
      dispatchTrip,
      submitPod,
      injectIncident,
      setSimulationSpeed,
      resetDatabase,
      refreshTrips
    }}>
      {children}
    </AppContext.Provider>
  );
};
