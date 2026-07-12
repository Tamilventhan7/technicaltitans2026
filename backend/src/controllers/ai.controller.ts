import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Vehicle, Driver, SimulationHistoryModel, FleetMemoryModel, FleetDNAModel, CompatibilityScoreModel } from '../models';
import * as aiService from '../services/ai.service';
import { getDispatchRecommendations } from '../ai/dispatch';
import { askAiCopilot } from '../ai/gemini';
import { setSimulationSpeed, getSimulationSpeed } from '../simulation/engine';
import { resetDatabase } from '../db'; // we will keep DB reset helper in db.ts or adapt it

// Gemini Copilot
export async function askCopilot(req: AuthenticatedRequest, res: Response) {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query prompt is required' });
  }

  try {
    const reply = await askAiCopilot(query);
    res.json(reply);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Dispatch recommendations
export async function getDispatchRecommendationsEndpoint(req: AuthenticatedRequest, res: Response) {
  const { originId, destinationId, cargoWeightKG, cargoType } = req.body;

  try {
    const list = await getDispatchRecommendations(originId, destinationId, cargoWeightKG, cargoType);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// What-If stress test simulation endpoint (from original index.ts)
export async function whatIfSimulation(req: AuthenticatedRequest, res: Response) {
  const { fuelPriceMultiplier, orderVolumeSpike, activeDriversUnavailableCount, weatherSeverity } = req.body;

  try {
    // Model metrics
    const currentFuelPriceBase = 1.20;
    const simulatedFuelCost = currentFuelPriceBase * fuelPriceMultiplier;

    const trips = await Vehicle.find({ status: 'in-transit', isDeleted: false });

    // Projected margins calculation
    let profitReduction = 0;
    let expectedDelayCount = 0;
    let projectedUnutilizedAssets = activeDriversUnavailableCount;

    trips.forEach(t => {
      const estimatedTripRemainingFuel = 150; // estimate
      profitReduction += estimatedTripRemainingFuel * (simulatedFuelCost - currentFuelPriceBase);

      if (weatherSeverity === 'storm' || weatherSeverity === 'snow') {
        expectedDelayCount += 1;
      }
    });

    if (orderVolumeSpike > 0) {
      const availableTrucks = await Vehicle.countDocuments({ status: 'idle', isDeleted: false });
      if (orderVolumeSpike > availableTrucks) {
        projectedUnutilizedAssets += (orderVolumeSpike - availableTrucks);
      }
    }

    const report = {
      fuelCostIncreasePercent: Math.round((fuelPriceMultiplier - 1) * 100),
      projectedProfitDeltaUSD: -Math.round(profitReduction),
      expectedDelayedTripsCount: expectedDelayCount,
      projectedSlaFulfillmentPercent: weatherSeverity === 'storm' ? 78 : weatherSeverity === 'snow' ? 84 : 98,
      recommendation: weatherSeverity === 'storm' 
        ? 'WARNING: Storm cell detected. Postpone Chicago hub departures. Re-route LAX shipments south via I-10.' 
        : 'Sufficient backup assets exist. Proceed with standard AI-optimized routing schedule.'
    };

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Fleet DNA Engine
export async function getFleetDnaReport(req: AuthenticatedRequest, res: Response) {
  try {
    const vehicles = await Vehicle.find({ isDeleted: false });
    const reports = [];
    for (const vehicle of vehicles) {
      const dna = await aiService.calculateVehicleDna(vehicle.id);
      if (dna) reports.push(dna);
    }
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVehicleDna(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const dna = await aiService.calculateVehicleDna(id);
    if (!dna) {
      return res.status(404).json({ error: `Vehicle DNA profile not found for vehicle ${id}` });
    }
    res.json(dna);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Compatibility Engine
export async function getCompatibilityReport(req: AuthenticatedRequest, res: Response) {
  try {
    const drivers = await Driver.find({ isDeleted: false });
    const vehicles = await Vehicle.find({ isDeleted: false });
    const reports = [];

    // Evaluate pairings
    for (let i = 0; i < Math.min(drivers.length, vehicles.length); i++) {
      const comp = await aiService.calculateCompatibility(drivers[i].id, vehicles[i].id);
      if (comp) reports.push(comp);
    }
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDriverCompatibility(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const vehicles = await Vehicle.find({ isDeleted: false });
    const reports = [];
    for (const vehicle of vehicles) {
      const comp = await aiService.calculateCompatibility(id, vehicle.id);
      if (comp) reports.push(comp);
    }
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVehicleCompatibility(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const drivers = await Driver.find({ isDeleted: false });
    const reports = [];
    for (const driver of drivers) {
      const comp = await aiService.calculateCompatibility(driver.id, id);
      if (comp) reports.push(comp);
    }
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Fleet Memory & Learning System
export async function getFleetMemoryList(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await aiService.getOrGenerateMemories();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLearningRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await aiService.getOrGenerateMemories();
    const recommendations = list.map(item => ({
      id: item.id,
      patternType: item.patternType,
      confidence: item.confidence,
      recommendation: item.suggestion
    }));
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Emergency Simulator
export async function runEmergencySimulation(req: AuthenticatedRequest, res: Response) {
  const { disruptionType } = req.body; // e.g. 'weather_disruption', 'vehicle_breakdown'
  if (!disruptionType) {
    return res.status(400).json({ error: 'Disruption type is required' });
  }

  try {
    const result = await aiService.simulateEmergency(disruptionType);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSimulationHistoryList(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await SimulationHistoryModel.find({ isDeleted: false }).sort({ timestamp: -1 });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// System Operations
export async function systemReset(req: AuthenticatedRequest, res: Response) {
  try {
    await resetDatabase();
    res.json({ success: true, message: 'Database reset to standard seeds.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function setSpeed(req: AuthenticatedRequest, res: Response) {
  const { multiplier } = req.body;
  if (typeof multiplier === 'number') {
    setSimulationSpeed(multiplier);
    res.json({ success: true, multiplier });
  } else {
    res.status(400).json({ error: 'Valid multiplier number required.' });
  }
}
