import { getVehicles, getDrivers, getTrips, getAlerts, getMaintenanceLogs, getFuelRecords } from '../db';
import { Trip, Vehicle, Driver, Alert } from '../types';

export interface AIResponse {
  message: string;
  widget?: {
    type: 'chart' | 'list' | 'actions' | 'kpis';
    title: string;
    data: any;
    meta?: any;
  };
}

export async function processLocalNLPQuery(query: string): Promise<AIResponse> {
  const normalized = query.toLowerCase().trim();

  const vehicles = await getVehicles();
  const drivers = await getDrivers();
  const trips = await getTrips();
  const alerts = await getAlerts();
  const maintenanceLogs = await getMaintenanceLogs();

  // 1. SAFE DRIVERS / SAFEST DRIVER
  if (normalized.includes('safe') || normalized.includes('driver safety') || normalized.includes('leaderboard')) {
    const sortedDrivers = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore);
    const topDriver = sortedDrivers[0];
    
    return {
      message: `### Driver Safety Analysis\nOur safest driver currently on roster is **${topDriver.name}** (ID: ${topDriver.id}) with a Safety Score of **${topDriver.safetyScore}%** and a **${topDriver.gamification.tier}** tier status. He is currently on a **${topDriver.gamification.safeDrivingStreak}-day safe driving streak**.\n\nBelow is the active fleet ranking leaderboard.`,
      widget: {
        type: 'list',
        title: 'Driver Safety Rankings',
        data: sortedDrivers.map(d => ({
          label: d.name,
          subLabel: `Tier: ${d.gamification.tier} | Score: ${d.safetyScore}%`,
          value: `${d.totalMiles.toFixed(0)} Miles`,
          status: d.safetyScore > 90 ? 'success' : d.safetyScore > 80 ? 'warning' : 'danger'
        }))
      }
    };
  }

  // 2. DELAYED / ACTIVE DELIVERIES
  if (normalized.includes('delay') || normalized.includes('late') || normalized.includes('where is') || normalized.includes('where are')) {
    const delayedTrips = trips.filter(t => t.status === 'delayed');
    if (delayedTrips.length === 0) {
      return {
        message: `### Live Delivery Audit\nAll active trips are currently tracking **On-Time**. No geofence delays, weather risks, or mechanical hold-ups are affecting operations at this moment.`,
        widget: {
          type: 'kpis',
          title: 'On-Time Performance',
          data: [
            { label: 'Active Trips', value: trips.filter(t => t.status === 'in-transit').length },
            { label: 'Delayed Trips', value: 0 },
            { label: 'SLA Fulfillment', value: '98.4%' }
          ]
        }
      };
    }

    return {
      message: `### Delayed Shipments Identified\nWe have detected **${delayedTrips.length} delayed trip(s)**. Here are the active alerts causing the disruptions:\n\n` + 
        delayedTrips.map(t => `* **Trip ${t.id}** (${t.origin.name} ➔ ${t.destination.name}) is delayed. Assigned Driver: **${drivers.find(d => d.id === t.driverId)?.name}**`).join('\n'),
      widget: {
        type: 'list',
        title: 'Delayed Shipments',
        data: delayedTrips.map(t => ({
          label: `${t.origin.name} ➔ ${t.destination.name}`,
          subLabel: `Trip: ${t.id} | Driver: ${drivers.find(d => d.id === t.driverId)?.name || 'N/A'}`,
          value: 'Delayed',
          status: 'danger'
        }))
      }
    };
  }

  // 3. MAINTENANCE REQUIRED / VEHICLES NEEDING SERVICE
  if (normalized.includes('maintenance') || normalized.includes('repair') || normalized.includes('broken') || normalized.includes('health') || normalized.includes('fail')) {
    const criticalVehicles = vehicles.filter(v => v.healthScore < 80);
    if (criticalVehicles.length === 0) {
      return {
        message: `### Fleet Mechanical Health Report\nAll vehicles are operating within optimal temperature and pressure tolerances. The average fleet health score is **${Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length)}%**.\n\nNo pending emergency check-engine logs detected.`,
      };
    }

    return {
      message: `### Vehicles Requiring Maintenance\nWe have identified **${criticalVehicles.length} vehicle(s)** with health scores under **80%** that require diagnostic inspections and preventive maintenance. Check the recommended actions below:`,
      widget: {
        type: 'actions',
        title: 'Pending Maintenance Recommendations',
        data: criticalVehicles.map(v => ({
          id: `maintenance-schedule-${v.id}`,
          actionLabel: `Schedule ${v.id} Service`,
          title: `${v.id} - Health Score ${v.healthScore}%`,
          description: `Telemetry Warning: Temp ${v.telemetry.engineTemp.toFixed(1)}°C, Pressure ${v.telemetry.oilPressure} PSI. Likely to fail within 5 days if unserviced.`,
          payload: { vehicleId: v.id, type: 'Sensor Calibration' }
        }))
      }
    };
  }

  // 4. FUEL PREDICTION
  if (normalized.includes('fuel expense') || normalized.includes('fuel cost') || normalized.includes('predict') || normalized.includes('expense')) {
    const historicalTrips = trips.filter(t => t.status === 'delivered');
    const totalFuelCost = historicalTrips.reduce((acc, t) => acc + t.financials.fuelCost, 0);
    const avgFuelCostPerTrip = historicalTrips.length > 0 ? totalFuelCost / historicalTrips.length : 140;

    // Generate simulated weeks
    const currentWeekCost = Math.round(avgFuelCostPerTrip * 12);
    const predictions = [
      { name: 'Week 1 (Actual)', cost: Math.round(currentWeekCost * 0.95) },
      { name: 'Week 2 (Actual)', cost: currentWeekCost },
      { name: 'Week 3 (Proj)', cost: Math.round(currentWeekCost * 1.05) },
      { name: 'Week 4 (Proj)', cost: Math.round(currentWeekCost * 1.15) }
    ];

    return {
      message: `### Fuel Expense Forecast\nBased on historical telematics and current simulation indexes, next month's fuel costs are projected to rise **~8.2%** due to weather delays and higher idling durations.\n\n* **Estimated Monthly Fuel Budget**: **$${(currentWeekCost * 4.2).toLocaleString()}**\n* **Average Cost Per Kilometer**: **$0.38**\n\nWe recommend scheduling trips during off-peak hours and reducing speeds on SPR-vans to optimize burns.`,
      widget: {
        type: 'chart',
        title: 'Weekly Fuel Expenses ($)',
        data: predictions
      }
    };
  }

  // 5. TRUCK FUEL CONSUMPTION (Specific TRK case)
  if (normalized.includes('trk-') || normalized.includes('truck-') || normalized.includes('consuming')) {
    const match = normalized.match(/trk-\d+/);
    const vehicleId = match ? match[0].toUpperCase() : 'TRK-07';
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return { message: `Vehicle **${vehicleId}** not found in the active fleet registry.` };
    }

    let explanation = `### Telemetry Diagnostic: ${vehicleId}\nVehicle **${vehicle.id}** (${vehicle.type}) shows abnormal fuel rates. \n\n`;
    if (vehicle.healthScore < 70) {
      explanation += `* **Low Health Index (${vehicle.healthScore}%)**: Engine friction and cylinder temperatures are elevated (${vehicle.telemetry.engineTemp.toFixed(1)}°C), decreasing burn efficiency.\n`;
    }
    if (vehicle.gps.speed > 100) {
      explanation += `* **Speed Profiling**: Active speeding thresholds logged. Air drag at 110+ KM/H spikes fuel burn by 22%.\n`;
    }
    if (vehicle.type === 'Reefer') {
      explanation += `* **Reefer Compressor Pull**: Cold-chain cargo cooling engine requires auxiliary fuel draw of up to 4.5 liters per hour.\n`;
    }
    explanation += `* **Idle Factor**: Idle time exceeds limits. Odometer represents high stop-and-go highway delay ratios.`;

    return {
      message: explanation,
      widget: {
        type: 'kpis',
        title: `${vehicleId} Diagnostic Telemetry`,
        data: [
          { label: 'Odometer (KM)', value: vehicle.odometer.toFixed(0) },
          { label: 'Health Score', value: `${vehicle.healthScore}%` },
          { label: 'Current Fuel', value: `${Math.round(vehicle.currentFuel)} L` }
        ]
      }
    };
  }

  // 6. HOW TO REDUCE COST
  if (normalized.includes('reduce') || normalized.includes('save') || normalized.includes('optimize') || normalized.includes('cost')) {
    return {
      message: `### AI Operational Efficiency Plan\nTo reduce fleet costs by **12-15%**, implement the following optimizations:\n\n` +
        `1. **Dynamic Routing**: Re-route active trips through Route B to bypass Chicago city tolls (saves ~$45 per trip).\n` +
        `2. **Idle Limit Controls**: Remotely flag trucks idling over 15 minutes. Idle time accounts for 8% of wasted fuel.\n` +
        `3. **Driver Behavior Training**: Driver Carlos Gomez (DRV-04) has harsh braking scores. Improving driver smoothness reduces tire wear and improves fuel efficiency.\n` +
        `4. **Preventive Upgrades**: Schedule TRK-07's engine overhaul immediately to restore its fuel efficiency from 3.3 KM/L to 3.8 KM/L.`,
      widget: {
        type: 'actions',
        title: 'Cost Reduction Actions',
        data: [
          { id: 'cost-overhaul-07', actionLabel: 'Approve TRK-07 Maintenance', title: 'Schedule TRK-07 Engine Overhaul', description: 'Restores engine cylinder compression, increasing fuel economy.', payload: { vehicleId: 'TRK-07', type: 'Engine Overhaul' } },
          { id: 'cost-coaching-04', actionLabel: 'Assign Driver Coaching', title: 'Driver Coaching: Carlos Gomez', description: 'Send safe driving modules focusing on acceleration and progressive braking.', payload: { driverId: 'DRV-04' } }
        ]
      }
    };
  }

  // 7. WEEKLY REPORT / PERFORMANCE
  if (normalized.includes('report') || normalized.includes('weekly') || normalized.includes('performance')) {
    const weeklyData = [
      { name: 'Mon', Revenue: 4200, Expenses: 3100, Profit: 1100 },
      { name: 'Tue', Revenue: 5100, Expenses: 3600, Profit: 1500 },
      { name: 'Wed', Revenue: 4800, Expenses: 3400, Profit: 1400 },
      { name: 'Thu', Revenue: 5500, Expenses: 3800, Profit: 1700 },
      { name: 'Fri', Revenue: 6200, Expenses: 4100, Profit: 2100 },
      { name: 'Sat', Revenue: 3100, Expenses: 2200, Profit: 900 },
      { name: 'Sun', Revenue: 2400, Expenses: 1800, Profit: 600 }
    ];

    return {
      message: `### Weekly Operations Report\nSummary for the current week:\n* **Net Revenue**: **$33,700**\n* **Net Operating Expenses**: **$22,000**\n* **Net Profit**: **$11,700** (Margin: **34.7%**)\n* **Carbon Footprint**: **~2,450 KG CO2**\n* **On-Time Delivery SLA**: **97.8%**`,
      widget: {
        type: 'chart',
        title: 'Operational Revenue vs Profit ($)',
        data: weeklyData
      }
    };
  }

  // 8. CEO SUMMARY
  if (normalized.includes('ceo') || normalized.includes('summary') || normalized.includes('executive')) {
    const totalRevenue = trips.reduce((acc, t) => acc + t.financials.revenue, 0);
    const totalCost = trips.reduce((acc, t) => acc + t.financials.cost, 0);
    const totalProfit = totalRevenue - totalCost;
    const avgHealth = Math.round(vehicles.reduce((acc, v) => acc + v.healthScore, 0) / vehicles.length);

    return {
      message: `### Executive Operations Summary\nTransitOps AI+ Platform Performance overview:\n\n* **Active Dispatch Network**: **${trips.filter(t => t.status === 'in-transit').length}** vehicles rolling, **${warehousesCountActive(trips)}** logistics nodes loaded.\n* **Fleet Reliability**: Average mechanical health is at **${avgHealth}%**.\n* **Financial Health**: Gross Profit represents **$${totalProfit.toLocaleString()}**.\n* **Operational Exceptions**: **${alerts.filter(a => !a.resolved).length}** active warnings require attention.\n\nOperations are highly profitable; we recommend scheduling critical service on TRK-07 immediately to mitigate downtime risk.`,
      widget: {
        type: 'kpis',
        title: 'CEO Operations Overview',
        data: [
          { label: 'Cumulative Revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Cumulative Profit', value: `$${totalProfit.toLocaleString()}` },
          { label: 'Active Alerts', value: alerts.filter(a => !a.resolved).length }
        ]
      }
    };
  }

  // DEFAULT
  return {
    message: `### Hello, I am the TransitOps AI Fleet Copilot.
I analyze live telematics and dispatch databases in real-time. You can ask me questions like:
* **"Where are my delayed deliveries?"** - View active logistics delays.
* **"Show vehicles requiring maintenance."** - Review engine health and schedule repairs.
* **"Predict next month's fuel expense."** - Get cost forecasts.
* **"Find my safest driver."** - View driver rankings and achievements.
* **"Why is Truck-07 consuming more fuel?"** - View vehicle telemetry diagnostics.
* **"How can I reduce operational cost?"** - Get immediate efficiency optimization tasks.
* **"Generate CEO summary."** - Executive overview.
`
  };
}

function warehousesCountActive(trips: Trip[]): number {
  const hubs = new Set<string>();
  trips.filter(t => t.status === 'in-transit').forEach(t => {
    hubs.add(t.origin.name);
    hubs.add(t.destination.name);
  });
  return hubs.size || 5;
}
