import { Vehicle, Driver, Trip, FleetDNAModel, CompatibilityScoreModel, FleetMemoryModel, SimulationHistoryModel } from '../models';

// --------------------------------------------------
// A. Fleet DNA Engine
// --------------------------------------------------
export async function calculateVehicleDna(vehicleId: string) {
  const vehicle = await Vehicle.findOne({ id: vehicleId, isDeleted: false });
  if (!vehicle) return null;

  let profileType: 'Workhorse' | 'Fuel Saver' | 'City Specialist' | 'Heavy Duty Expert' | 'Premium Performer' | 'High Maintenance Asset' = 'Workhorse';
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const riskIndicators: string[] = [];
  const recommendedUseCases: string[] = [];
  let retirementRisk: 'low' | 'medium' | 'high' = 'low';

  // Rules based profile typing
  if (vehicle.healthScore < 70) {
    profileType = 'High Maintenance Asset';
    weaknesses.push('Elevated mechanical failure risks', 'Sub-optimal thermodynamic engine performance');
    riskIndicators.push('Engine temperature spikes', 'High oil friction coefficient');
    recommendedUseCases.push('Short range light duties', 'Standby backing operations');
    retirementRisk = vehicle.healthScore < 55 ? 'high' : 'medium';
  } else if (vehicle.type === 'Heavy Duty Truck' && vehicle.fuelCapacity >= 350) {
    profileType = 'Heavy Duty Expert';
    strengths.push('Excellent payload capacity', 'High structural integrity on off-road terrain');
    recommendedUseCases.push('Cross-country bulk shipments', 'Hazmat heavy load transports');
  } else if (vehicle.fuelEfficiency >= 7.0) {
    profileType = 'Fuel Saver';
    strengths.push('Outstanding fuel economy', 'Reduced carbon footprint emissions');
    recommendedUseCases.push('Long-haul fuel optimized routing', 'Eco-friendly target orders');
  } else if (vehicle.type === 'Sprinter Van' || vehicle.type === 'Medium Cargo') {
    profileType = 'City Specialist';
    strengths.push('High urban agility', 'Easy docking clearances');
    recommendedUseCases.push('Last-mile deliveries', 'Multi-stop urban dispatch packages');
  } else if (vehicle.healthScore >= 95 && vehicle.fuelEfficiency >= 4.0) {
    profileType = 'Premium Performer';
    strengths.push('Peak mechanical health', 'Highly reliable telemetry metrics');
    recommendedUseCases.push('High-value cargo assignments', 'Tight delivery SLA schedules');
  } else {
    profileType = 'Workhorse';
    strengths.push('Consistent duty execution', 'Stable fuel performance');
    recommendedUseCases.push('Standard regional cargo distribution');
  }

  // Common fallbacks
  if (strengths.length === 0) strengths.push('Reliable operation log history');
  if (weaknesses.length === 0) weaknesses.push('High fuel burn under max loads');
  if (riskIndicators.length === 0) riskIndicators.push('Odometer wear degradation');

  const dna = {
    id: `DNA-${vehicleId}`,
    vehicleId,
    profileType,
    strengths,
    weaknesses,
    riskIndicators,
    recommendedUseCases,
    retirementRisk,
    lastUpdated: new Date()
  };

  // Upsert into DB
  await FleetDNAModel.replaceOne({ vehicleId }, dna, { upsert: true });

  return dna;
}

// --------------------------------------------------
// B. Vehicle Compatibility Engine
// --------------------------------------------------
export async function calculateCompatibility(driverId: string, vehicleId: string) {
  const driver = await Driver.findOne({ id: driverId, isDeleted: false });
  const vehicle = await Vehicle.findOne({ id: vehicleId, isDeleted: false });

  if (!driver || !vehicle) return null;

  // Analysis variables
  let score = 75; // baseline

  const factors = {
    historicalPerformance: 80,
    fuelEfficiency: 85,
    deliverySuccess: 90,
    maintenanceIncidents: 85,
    customerRatings: Math.round(driver.rating * 20)
  };

  // Adjust score based on driver safety score
  if (driver.safetyScore > 90) score += 10;
  else if (driver.safetyScore < 80) score -= 15;

  // Adjust based on vehicle health
  if (vehicle.healthScore > 90) score += 5;
  else if (vehicle.healthScore < 70) score -= 10;

  // Fit rules: Sprinter Vans are specialized for City. Drivers with high safety scores fit reefers
  if (vehicle.type === 'Reefer' && driver.safetyScore > 90) {
    score += 5;
  }
  if (vehicle.type === 'Sprinter Van' && driver.totalMiles < 50000) {
    // junior driver fits sprinter well
    score += 8;
  }

  score = Math.max(10, Math.min(100, score));

  const recommendations = [];
  if (score > 85) {
    recommendations.push(`Excellent match. Driver ${driver.name} has safety ratings matching the mechanical capacity of ${vehicle.id}.`);
  } else if (score < 60) {
    recommendations.push(`Caution: Driver safety profile or vehicle health indicates operational dispatch risks.`);
  } else {
    recommendations.push(`Standard match. Suitable for routine logistics operations.`);
  }

  const result = {
    id: `COMP-${driverId}-${vehicleId}`,
    driverId,
    vehicleId,
    score,
    compatibilityFactors: factors,
    recommendations
  };

  await CompatibilityScoreModel.replaceOne({ driverId, vehicleId }, result, { upsert: true });

  return result;
}

// --------------------------------------------------
// C. Fleet Memory & Learning System
// --------------------------------------------------
export async function getOrGenerateMemories() {
  const existing = await FleetMemoryModel.find({ isDeleted: false });
  if (existing.length > 0) return existing;

  // Seed default learned memories if empty
  const defaultMemories = [
    {
      id: 'MEM-01',
      patternType: 'vehicle_degradation',
      description: 'Truck TRK-03 mechanical health logs indicate that it requires minor maintenance intervals every 8,000 KM.',
      targetId: 'TRK-03',
      variables: { kmInterval: 8000, triggerField: 'odometer' },
      confidence: 94,
      suggestion: 'Schedule inspection on TRK-03 when next odometer milestone reaches increments of 8000 KM.',
      isDeleted: false
    },
    {
      id: 'MEM-02',
      patternType: 'weather_impact',
      description: 'Historical trip analysis shows that rainy season operations increase highway route transit delays by 20%.',
      variables: { delayMultiplier: 1.20, condition: 'rain' },
      confidence: 88,
      suggestion: 'Extend ETA margins by 20% on dispatch orders when regional weather warnings indicate heavy rain.',
      isDeleted: false
    },
    {
      id: 'MEM-03',
      patternType: 'driver_behavior',
      description: 'Driver Carlos Gomez (DRV-04) logs harsh braking alerts primarily during early morning city routes.',
      targetId: 'DRV-04',
      variables: { category: 'harsh_braking', timePeriod: '06:00-09:00' },
      confidence: 76,
      suggestion: 'Recommend early morning driving simulator safety refresher modules to DRV-04.',
      isDeleted: false
    }
  ];

  await FleetMemoryModel.insertMany(defaultMemories);
  return FleetMemoryModel.find({ isDeleted: false });
}

// --------------------------------------------------
// D. Emergency Chain Reaction Simulator
// --------------------------------------------------
export async function simulateEmergency(disruptionType: string) {
  const trips = await Trip.find({ status: { $in: ['in-transit', 'delayed'] }, isDeleted: false });
  
  let affectedTrips = 0;
  let revenueImpact = 0;
  let slaRisk = 'low';
  let delayMinutes = 0;
  let recoveryPlan = '';

  switch (disruptionType) {
    case 'weather_disruption':
      affectedTrips = trips.length;
      revenueImpact = Math.round(trips.reduce((acc, t) => acc + t.financials.revenue * 0.15, 0));
      slaRisk = 'medium';
      delayMinutes = 90;
      recoveryPlan = 'Re-route all active cross-country heavy loads south to avoid blizzard storm warnings. Extend customer ETAs by 90 minutes.';
      break;
    case 'vehicle_breakdown':
      affectedTrips = Math.min(trips.length, 1);
      revenueImpact = trips.length > 0 ? Math.round(trips[0].financials.revenue * 0.5) : 800;
      slaRisk = 'high';
      delayMinutes = 240;
      recoveryPlan = 'Dispatch nearest idle backup vehicle and available roadside assistant driver to hot-swap cargo payload.';
      break;
    case 'driver_unavailability':
      affectedTrips = Math.min(trips.length, 2);
      revenueImpact = 1200;
      slaRisk = 'medium';
      delayMinutes = 120;
      recoveryPlan = 'Engage standby contract drivers and assign them to pending high-value shipments.';
      break;
    case 'fuel_shortages':
      affectedTrips = trips.length;
      revenueImpact = Math.round(trips.reduce((acc, t) => acc + t.financials.revenue * 0.25, 0));
      slaRisk = 'high';
      delayMinutes = 180;
      recoveryPlan = 'Mandate speed limit controls to 80 KM/H to optimize fuel burns. Route fuel refueling strictly to pre-negotiated terminal hubs.';
      break;
    case 'demand_spikes':
      affectedTrips = Math.round(trips.length * 1.5);
      revenueImpact = -3500; // positive impact
      slaRisk = 'low';
      delayMinutes = 30;
      recoveryPlan = 'Increase simulation speed factor. Dispatch all idle trucks and offer peak safety rewards to drivers.';
      break;
    default:
      affectedTrips = 0;
      revenueImpact = 0;
      slaRisk = 'low';
      delayMinutes = 0;
      recoveryPlan = 'Standard operation schedule remains optimized.';
  }

  const result = await SimulationHistoryModel.create({
    id: `SIM-${Date.now()}`,
    timestamp: new Date(),
    simulatedEvents: [{
      type: disruptionType,
      description: `Injected emergency trigger: ${disruptionType.replace('_', ' ')}`
    }],
    metricsImpact: {
      revenueImpactUSD: revenueImpact,
      delayedTripsCount: affectedTrips,
      slaFulfillmentPercent: slaRisk === 'high' ? 74 : slaRisk === 'medium' ? 86 : 98
    },
    recoveryPlan,
    isDeleted: false
  });

  return result;
}
