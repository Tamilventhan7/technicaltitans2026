import { Server } from 'socket.io';
import { 
  getVehicles, saveVehicle, 
  getDrivers, saveDriver, 
  getTrips, saveTrip, 
  getAlerts, saveAlert, 
  getSimulationConfig 
} from '../db';
import { Trip, Vehicle, Driver, Alert, GPSCoordinate, SimulationConfig } from '../types';

let ioInstance: Server | null = null;
let intervalId: NodeJS.Timeout | null = null;
let simMultiplier = 1; // 1x, 5x, 10x, 60x

export function setIoInstance(io: Server) {
  ioInstance = io;
}

export function setSimulationSpeed(multiplier: number) {
  simMultiplier = multiplier;
  console.log(`Simulation time multiplier updated to: ${simMultiplier}x`);
  if (ioInstance) {
    tick().catch(err => console.error('Error ticking on speed update:', err));
  }
}

export function getSimulationSpeed(): number {
  return simMultiplier;
}

// Start ticking simulator
export function startSimulation() {
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      await tick();
    } catch (err) {
      console.error('Error during simulation tick:', err);
    }
  }, 1000);
  console.log('TransitOps Digital Twin Simulation Engine started.');
}

export function stopSimulation() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Tick calculations
async function tick() {
  const trips = await getTrips();
  const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'delayed');
  const vehicles = await getVehicles();
  const drivers = await getDrivers();

  if (activeTrips.length > 0) {
    const config = await getSimulationConfig();

    for (const trip of activeTrips) {
      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      if (!vehicle || !driver) continue;

      // Advance GPS location along pre-interpolated path index
      let speed = vehicle.gps.speed;

      // Determine target speed based on traffic config
      let targetSpeed = 80; // Standard highway speed KM/H
      if (vehicle.type === 'Sprinter Van') targetSpeed = 95;
      else if (vehicle.type === 'Medium Cargo') targetSpeed = 85;
      
      // Slow down in heavy weather/traffic
      if (config.weatherSeverity === 'storm' || config.weatherSeverity === 'snow') targetSpeed -= 30;
      else if (config.weatherSeverity === 'rain') targetSpeed -= 15;

      if (config.trafficLevel === 'heavy') targetSpeed -= 20;
      else if (config.trafficLevel === 'jammed') targetSpeed -= 45;

      // Apply speed limits if delayed or in-transit
      if (trip.status === 'delayed') targetSpeed = Math.min(targetSpeed, 40); // slow or broken down
      
      // Move speed closer to target
      if (speed < targetSpeed) speed = Math.min(targetSpeed, speed + 10);
      else if (speed > targetSpeed) speed = Math.max(targetSpeed, speed - 15);

      // If vehicle has critical breakdown alert, speed goes to 0
      const activeCriticalAlert = await findActiveTripAlert(trip.id, 'accident');
      const activeBreakdownAlert = await findActiveTripAlert(trip.id, 'maintenance');
      if (activeCriticalAlert || activeBreakdownAlert) {
        speed = 0;
      }

      vehicle.gps.speed = speed;

      // Update coordinate indices based on speed and multiplier
      const distanceThisTickKM = (speed * (1 / 3600)) * simMultiplier;

      // Odometer
      vehicle.odometer += distanceThisTickKM;
      driver.totalMiles += distanceThisTickKM;

      const stepRatio = Math.max(1, Math.ceil(distanceThisTickKM * 20)); // scaling factor
      const newIdx = Math.min(trip.currentRouteIndex + (stepRatio * simMultiplier), trip.route.length - 1);
      trip.currentRouteIndex = newIdx;

      const currentCoords = trip.route[newIdx];
      vehicle.gps.latitude = currentCoords.lat;
      vehicle.gps.longitude = currentCoords.lng;

      // Fuel depletion calculation
      let burnPerKM = 0.28;
      if (vehicle.type === 'Sprinter Van') burnPerKM = 0.12;
      else if (vehicle.type === 'Medium Cargo') burnPerKM = 0.20;
      else if (vehicle.type === 'Reefer') burnPerKM = 0.33;

      const cargoFactor = (trip.cargoWeight / 10000) * 0.05;
      let weatherFactor = 1.0;
      if (config.weatherSeverity === 'storm') weatherFactor = 1.25;
      else if (config.weatherSeverity === 'rain') weatherFactor = 1.1;

      const currentBurnRate = burnPerKM * (1 + cargoFactor) * weatherFactor * config.fuelPriceMultiplier;
      const fuelBurned = distanceThisTickKM * currentBurnRate;

      vehicle.currentFuel = Math.max(0, vehicle.currentFuel - fuelBurned);

      // Telemetry noise simulation
      if (speed > 0) {
        vehicle.telemetry.engineTemp = 80 + Math.random() * 5 + (config.weatherSeverity === 'storm' ? 5 : 0);
        vehicle.telemetry.oilPressure = 50 + Math.random() * 4 - (vehicle.healthScore < 60 ? 10 : 0);
        vehicle.telemetry.batteryVoltage = 13.8 + Math.random() * 0.4;
      } else {
        vehicle.telemetry.engineTemp = Math.max(60, vehicle.telemetry.engineTemp - 0.5);
        vehicle.telemetry.oilPressure = 30; // idling
      }

      // Driver fatigue
      driver.activeHoursToday += (1 / 3600) * simMultiplier;
      if (driver.activeHoursToday > 11) {
        driver.status = 'resting';
        const fatigueAlertId = `AL-FAT-${trip.id}`;
        const existing = (await getAlerts()).find(a => a.id === fatigueAlertId);
        if (!existing) {
          await triggerAlert({
            id: fatigueAlertId,
            tripId: trip.id,
            driverId: driver.id,
            category: 'fatigue',
            severity: 'warning',
            message: `Safety Violation: Driver ${driver.name} has exceeded 11 hours maximum shift limit. Fatigue warning active.`,
            timestamp: new Date().toISOString(),
            resolved: false,
            location: currentCoords
          });
        }
      }

      // Financial updates
      const fuelCostBurned = fuelBurned * 1.20 * config.fuelPriceMultiplier; // $1.20 per liter base
      trip.financials.fuelCost += fuelCostBurned;
      trip.financials.driverCost += distanceThisTickKM * 0.45; // $0.45/KM
      trip.financials.tollCost += distanceThisTickKM * 0.05; // $0.05/KM
      trip.financials.cost = trip.financials.fuelCost + trip.financials.driverCost + trip.financials.tollCost;
      trip.financials.profit = trip.financials.revenue - trip.financials.cost;

      trip.telemetryLogs.push({
        timestamp: new Date().toISOString(),
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        speed: speed,
        fuelRemaining: vehicle.currentFuel
      });
      if (trip.telemetryLogs.length > 200) {
        trip.telemetryLogs.shift();
      }

      // Check low fuel alert
      if (vehicle.currentFuel < (vehicle.fuelCapacity * 0.15)) {
        const fuelAlertId = `AL-LF-${vehicle.id}`;
        const existing = (await getAlerts()).find(a => a.id === fuelAlertId && !a.resolved);
        if (!existing) {
          await triggerAlert({
            id: fuelAlertId,
            vehicleId: vehicle.id,
            category: 'weather_risk',
            severity: 'warning',
            message: `Fuel Alert: ${vehicle.id} has dropped below 15% fuel capacity (${Math.round(vehicle.currentFuel)}L remaining).`,
            timestamp: new Date().toISOString(),
            resolved: false,
            location: currentCoords
          });
        }
      }

      // Check random incidents
      const incidentChance = 0.005 * simMultiplier;
      if (Math.random() < incidentChance && speed > 0 && !activeCriticalAlert && !activeBreakdownAlert) {
        await injectRandomAnomaly(trip, vehicle, driver, currentCoords);
      }

      // Delivery completed check
      if (newIdx >= trip.route.length - 1) {
        trip.status = 'delivered';
        trip.actualArrivalTime = new Date().toISOString();
        vehicle.status = 'idle';
        driver.status = 'available';

        let pointsGained = 500;
        if (trip.alertsTriggered.length === 0) {
          pointsGained += 250;
          driver.gamification.safeDrivingStreak += 1;
        }
        driver.gamification.points += pointsGained;

        if (driver.gamification.points > 12000) driver.gamification.tier = 'Diamond';
        else if (driver.gamification.points > 8000) driver.gamification.tier = 'Gold';
        else if (driver.gamification.points > 4000) driver.gamification.tier = 'Silver';

        await triggerAlert({
          id: `AL-DEL-${trip.id}`,
          tripId: trip.id,
          category: 'weather_risk',
          severity: 'info',
          message: `Trip Completed: Route ${trip.origin.name} to ${trip.destination.name} delivered successfully. Driver gained ${pointsGained} points!`,
          timestamp: new Date().toISOString(),
          resolved: true,
          location: currentCoords
        });
      }

      // Save states
      await saveVehicle(vehicle);
      await saveDriver(driver);
      await saveTrip(trip);
    }
  }

  // Socket notification
  if (ioInstance) {
    // Generate summarized KPIs for this tick
    const allTrips = await getTrips();
    const liveAlerts = (await getAlerts()).filter(a => !a.resolved);
    const activeCount = activeTrips.length;
    const completedCount = allTrips.filter(t => t.status === 'delivered').length;
    
    // Aggregates
    const revenueSum = allTrips.reduce((acc, t) => acc + t.financials.revenue, 0);
    const costSum = allTrips.reduce((acc, t) => acc + t.financials.cost, 0);
    const emissionsSum = allTrips.reduce((acc, t) => acc + (t.financials.fuelCost * 2.68), 0); // 2.68 KG CO2 per liter roughly
    
    ioInstance.emit('sim-tick', {
      vehicles,
      drivers,
      trips: activeTrips,
      alerts: liveAlerts,
      kpis: {
        activeTripsCount: activeCount,
        completedTripsCount: completedCount,
        totalRevenue: revenueSum,
        totalProfit: revenueSum - costSum,
        fleetHealthAvg: Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length),
        carbonEmissionsKG: Math.round(emissionsSum),
        alertsCount: liveAlerts.length,
        multiplier: simMultiplier
      }
    });
  }
}

// Checks if a trip has an active alert of a certain type
async function findActiveTripAlert(tripId: string, category: string): Promise<Alert | null> {
  const alerts = await getAlerts();
  const alert = alerts.find(a => a.tripId === tripId && a.category === category && !a.resolved);
  return alert || null;
}

// Triggers alert and pushes to sockets
async function triggerAlert(alert: Alert) {
  await saveAlert(alert);
  if (ioInstance) {
    ioInstance.emit('alert-triggered', alert);
  }
}

// Injects an incident manually
export async function manualInjectIncident(tripId: string, category: string): Promise<Alert | null> {
  const trips = await getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip || trip.status === 'delivered' || trip.status === 'cancelled') return null;

  const vehicles = await getVehicles();
  const drivers = await getDrivers();
  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
  const driver = drivers.find(d => d.id === trip.driverId);

  if (!vehicle || !driver) return null;

  const currentCoords = trip.route[trip.currentRouteIndex];
  return await injectRandomAnomaly(trip, vehicle, driver, currentCoords, category);
}

// Random incident engine
async function injectRandomAnomaly(trip: Trip, vehicle: Vehicle, driver: Driver, location: GPSCoordinate, forcedCategory?: string): Promise<Alert> {
  const categories = ['speeding', 'harsh_braking', 'route_deviation', 'fuel_theft', 'maintenance', 'accident', 'weather_risk', 'traffic_delay'];
  const category = forcedCategory || categories[Math.floor(Math.random() * categories.length)];

  let message = '';
  let severity: 'critical' | 'warning' | 'info' = 'warning';

  trip.alertsTriggered.push(category);

  switch (category) {
    case 'speeding':
      vehicle.gps.speed = 115; // Speeding limit is 90
      driver.safetyScore = Math.max(0, driver.safetyScore - 8);
      message = `Speed Violation: Vehicle ${vehicle.id} driving at 115 KM/H in 90 KM/H zone. Driver ${driver.name} flagged.`;
      break;
    case 'harsh_braking':
      vehicle.gps.speed = Math.max(10, vehicle.gps.speed - 45); // sudden deceleration
      driver.safetyScore = Math.max(0, driver.safetyScore - 5);
      message = `Harsh Braking Event: Overt telemetry deceleration captured for ${vehicle.id}. Safety score reduced.`;
      break;
    case 'route_deviation':
      message = `Geofence Violation: Vehicle ${vehicle.id} has deviated from the optimized AI route path.`;
      severity = 'info';
      break;
    case 'fuel_theft':
      vehicle.currentFuel = Math.max(10, vehicle.currentFuel - 65); // sudden fuel level reduction
      message = `Security Alert: Severe fuel drop (65 Liters) detected on ${vehicle.id}. Potential fuel theft at coordinate grid.`;
      severity = 'critical';
      break;
    case 'maintenance':
      vehicle.healthScore = Math.max(30, vehicle.healthScore - 35);
      trip.status = 'delayed';
      message = `Mechanical Fault: Critical coolant leak and check engine light active on vehicle ${vehicle.id}. Delayed.`;
      break;
    case 'accident':
      vehicle.healthScore = Math.max(10, vehicle.healthScore - 55);
      vehicle.gps.speed = 0;
      trip.status = 'delayed';
      driver.status = 'suspended';
      message = `Collision Warning: Vehicle ${vehicle.id} reported impact crash at coordinates. Emergency crews alerted.`;
      severity = 'critical';
      break;
    case 'weather_risk':
      message = `Hazard Warning: Severe thunder-cell storm tracking directly over Route ${trip.id}. Truck slowed to 45 KM/H.`;
      break;
    case 'traffic_delay':
      trip.status = 'delayed';
      message = `Transit Congestion: Construction zone and multi-vehicle accident ahead. Route delay predicted +45 mins.`;
      break;
  }

  const alert: Alert = {
    id: `AL-${category.slice(0, 3).toUpperCase()}-${Date.now()}`,
    tripId: trip.id,
    vehicleId: vehicle.id,
    driverId: driver.id,
    category: category as any,
    severity,
    message,
    timestamp: new Date().toISOString(),
    resolved: false,
    location
  };

  await triggerAlert(alert);
  await saveTrip(trip);
  await saveVehicle(vehicle);
  await saveDriver(driver);

  return alert;
}
