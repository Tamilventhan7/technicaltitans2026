import { Router } from 'express';
import { getTrips, resetDatabase, getAuditLogs, saveAuditLog } from '../db';
import { setSimulationSpeed } from '../simulation/engine';
import { askAiCopilot } from '../ai/gemini';
import { getDispatchRecommendations } from '../ai/dispatch';
import AuditLogModel from '../models/AuditLog';

const router = Router();

// Log Audit Action Helper
async function logAudit(user: string, action: string, details: string) {
  try {
    await saveAuditLog({ user, action, details });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// GET /system/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /system/audit-logs
router.post('/audit-logs', async (req, res) => {
  const { action, details, user } = req.body;
  if (!action || !details || !user) {
    return res.status(400).json({ success: false, message: 'Action, details, and user are required.' });
  }
  try {
    await saveAuditLog({ action, details, user });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /system/reset
router.post('/reset', async (req, res) => {
  try {
    await resetDatabase();
    await logAudit('Admin', 'System Reset', 'Database reset back to baseline seed settings.');
    res.json({ success: true, message: 'Database reset to default seed configurations.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /system/simulation-speed
router.post('/simulation-speed', (req, res) => {
  const { multiplier } = req.body;
  if (typeof multiplier === 'number') {
    setSimulationSpeed(multiplier);
    res.json({ success: true, multiplier });
  } else {
    res.status(400).json({ success: false, message: 'Valid multiplier number required.' });
  }
});

// POST /ai/copilot
router.post('/copilot', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, message: 'Query prompt required.' });
  try {
    const result = await askAiCopilot(query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /ai/dispatch-recommendation
router.post('/dispatch-recommendation', async (req, res) => {
  const { originId, destinationId, cargoWeightKG, cargoType } = req.body;
  try {
    const recommendations = await getDispatchRecommendations(originId, destinationId, cargoWeightKG, cargoType);
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /ai/what-if
router.post('/what-if', async (req, res) => {
  const { fuelPriceMultiplier, weatherSeverity } = req.body;

  try {
    const trips = await getTrips();
    const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'delayed');

    const currentFuelPriceBase = 95.00;
    const simulatedFuelCost = currentFuelPriceBase * fuelPriceMultiplier;

    let profitReduction = 0;
    let expectedDelayCount = 0;

    activeTrips.forEach(t => {
      const estimatedTripRemainingFuel = 150;
      profitReduction += estimatedTripRemainingFuel * (simulatedFuelCost - currentFuelPriceBase);

      if (weatherSeverity === 'storm' || weatherSeverity === 'snow') {
        expectedDelayCount += 1;
      }
    });

    const report = {
      fuelCostIncreasePercent: Math.round((fuelPriceMultiplier - 1) * 100),
      projectedProfitDeltaUSD: -Math.round(profitReduction),
      expectedDelayedTripsCount: expectedDelayCount,
      projectedSlaFulfillmentPercent: weatherSeverity === 'storm' ? 78 : weatherSeverity === 'snow' ? 84 : 98,
      recommendation: weatherSeverity === 'storm' 
        ? 'WARNING: Severe storm cell active. Halting departures from Chicago hub. Reroute NY shipments south via I-10.' 
        : 'Sufficient backup assets exist. Proceed with standard AI-optimized routing schedule.'
    };

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
