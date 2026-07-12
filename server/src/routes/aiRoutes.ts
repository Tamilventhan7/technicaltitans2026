import { Router, Request, Response } from 'express';
import { getVehicles, getDrivers, getTrips, getAlerts } from '../db';
import { askAiCopilot } from '../ai/gemini';
import { getDispatchRecommendations } from '../ai/dispatch';

const router = Router();

// ─── GET /api/ai/health ─────────────────────────────────────────────────────
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const vehicles = await getVehicles();
    const drivers = await getDrivers();

    const fleetHealthAvg = Math.round(
      vehicles.reduce((s: number, v: any) => s + (v.healthScore || 85), 0) / Math.max(vehicles.length, 1)
    );

    const driverSafetyAvg = Math.round(
      drivers.reduce((s: number, d: any) => s + (d.safetyScore || 80), 0) / Math.max(drivers.length, 1)
    );

    res.json({
      success: true,
      data: {
        fleetHealthAvg,
        driverSafetyAvg,
        fuelEfficiencyScore: 84,
        onTimeDeliveryScore: 76,
        carbonScore: 78,
        overallAiScore: Math.round((fleetHealthAvg + driverSafetyAvg + 84 + 76) / 4),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/ai/predict-maintenance ────────────────────────────────────────
router.get('/predict-maintenance', async (_req: Request, res: Response) => {
  try {
    const vehicles = await getVehicles();

    const predictions = vehicles.map((v: any) => {
      const odometerToService = 5000 - (v.odometer % 5000);
      const daysFactor = Math.round(odometerToService / 200); // Approx days at avg 200km/day
      let riskLevel = 'low';
      if (daysFactor <= 3) riskLevel = 'critical';
      else if (daysFactor <= 7) riskLevel = 'high';
      else if (daysFactor <= 15) riskLevel = 'medium';

      const parts = ['Oil Filter', 'Brake Pads', 'Air Filter', 'Coolant', 'Tyre Set', 'Battery', 'Sensor Array'];
      const partAtRisk = parts[Math.floor(v.odometer / 7000) % parts.length];

      return {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        type: v.type,
        currentOdometer: v.odometer,
        nextServiceOdometer: v.odometer + odometerToService,
        daysUntilService: daysFactor,
        riskLevel,
        partAtRisk,
        healthScore: v.healthScore || 85,
        confidence: 85 + Math.floor(Math.random() * 14),
      };
    });

    // Sort by risk level
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    predictions.sort((a: any, b: any) => riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder]);

    res.json({ success: true, data: predictions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/ai/recommendations ────────────────────────────────────────────
router.get('/recommendations', async (_req: Request, res: Response) => {
  try {
    const vehicles = await getVehicles();
    const drivers = await getDrivers();
    const alerts = await getAlerts();
    const activeAlerts = (alerts as any[]).filter((a: any) => !a.resolved);

    const recs: any[] = [];

    // Generate recommendations from live data
    vehicles.forEach((v: any) => {
      if ((v.healthScore || 85) < 80) {
        recs.push({
          id: `maint-${v.id}`,
          type: 'maintenance',
          priority: (v.healthScore || 85) < 70 ? 'critical' : 'high',
          title: 'Vehicle Health Degraded',
          msg: `${v.id} health score dropped to ${v.healthScore || 75}%. Recommend immediate inspection of engine and braking systems.`,
          vehicleId: v.id,
          confidence: 94,
          action: 'Schedule Service',
        });
      }
    });

    drivers.forEach((d: any) => {
      if ((d.activeHoursToday || 0) >= 9) {
        recs.push({
          id: `fatigue-${d.id}`,
          type: 'safety',
          priority: 'high',
          title: 'Driver Fatigue Risk',
          msg: `${d.name} has logged ${d.activeHoursToday}h today. Mandatory rest period required per HOS regulations.`,
          driverId: d.id,
          confidence: 99,
          action: 'Enforce Rest',
        });
      }
    });

    // Always add some AI-generated insights
    recs.push({
      id: 'route-opt-1',
      type: 'efficiency',
      priority: 'medium',
      title: 'Route Optimization Opportunity',
      msg: 'Route CHI→NYC via I-80 saves 18L fuel over current I-90 path. 14% cost reduction achievable.',
      confidence: 91,
      action: 'Apply Route',
    });

    recs.push({
      id: 'fuel-bulk',
      type: 'savings',
      priority: 'low',
      title: 'Bulk Fuel Discount',
      msg: 'Shell cluster contract at 3 highway stations offers 12% volume discount for 500L+ fills.',
      confidence: 88,
      action: 'View Deal',
    });

    if (activeAlerts.length > 0) {
      recs.push({
        id: 'alert-summary',
        type: 'risk',
        priority: activeAlerts.filter((a: any) => a.severity === 'critical').length > 0 ? 'critical' : 'high',
        title: `${activeAlerts.length} Unresolved Fleet Alerts`,
        msg: `${activeAlerts.filter((a: any) => a.severity === 'critical').length} critical and ${activeAlerts.filter((a: any) => a.severity === 'warning').length} warning alerts need immediate attention.`,
        confidence: 100,
        action: 'Review Alerts',
      });
    }

    res.json({ success: true, data: recs.slice(0, 10) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/ai/carbon-report ───────────────────────────────────────────────
router.get('/carbon-report', async (_req: Request, res: Response) => {
  try {
    const vehicles = await getVehicles();
    const trips = await getTrips();

    const completedTrips = (trips as any[]).filter((t: any) => t.status === 'delivered');
    const totalFuelEstimate = completedTrips.reduce((s: number, t: any) => s + (t.fuelUsed || 80), 0);
    const co2KgTotal = Math.round(totalFuelEstimate * 2.68);

    const weeklyData = [
      { week: 'W1', co2: Math.round(co2KgTotal * 0.28), target: Math.round(co2KgTotal * 0.22) },
      { week: 'W2', co2: Math.round(co2KgTotal * 0.25), target: Math.round(co2KgTotal * 0.22) },
      { week: 'W3', co2: Math.round(co2KgTotal * 0.24), target: Math.round(co2KgTotal * 0.22) },
      { week: 'W4', co2: Math.round(co2KgTotal * 0.23), target: Math.round(co2KgTotal * 0.22) },
    ];

    res.json({
      success: true,
      data: {
        totalCO2Kg: co2KgTotal,
        co2PerKm: 1.82,
        greenScore: 78,
        reductionVsLastMonth: 12,
        weeklyData,
        vehicleEmissions: vehicles.slice(0, 5).map((v: any, i: number) => ({
          vehicleId: v.id,
          estimatedCO2Kg: Math.round((v.fuelCapacity - v.currentFuel) * 2.68),
        })),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/ai/financial-forecast ─────────────────────────────────────────
router.get('/financial-forecast', async (_req: Request, res: Response) => {
  try {
    const trips = await getTrips();
    const completedTrips = (trips as any[]).filter((t: any) => t.status === 'delivered');

    const totalRevenue = completedTrips.reduce((s: number, t: any) => s + (t.financials?.revenue || 0), 0);
    const totalProfit = completedTrips.reduce((s: number, t: any) => s + (t.financials?.profit || 0), 0);

    const forecast = [
      { month: 'Current', revenue: totalRevenue || 640000, expenses: (totalRevenue || 640000) - (totalProfit || 250000), profit: totalProfit || 250000, projected: false },
      { month: 'Next Month', revenue: Math.round((totalRevenue || 640000) * 1.12), expenses: Math.round(((totalRevenue || 640000) - (totalProfit || 250000)) * 1.05), profit: 0, projected: true },
      { month: 'Month+2', revenue: Math.round((totalRevenue || 640000) * 1.22), expenses: Math.round(((totalRevenue || 640000) - (totalProfit || 250000)) * 1.08), profit: 0, projected: true },
    ];
    forecast[1].profit = forecast[1].revenue - forecast[1].expenses;
    forecast[2].profit = forecast[2].revenue - forecast[2].expenses;

    res.json({
      success: true,
      data: {
        forecast,
        confidence: 87,
        topExpenseCategories: [
          { cat: 'Fuel & Energy', amount: 124000, change: +14.8 },
          { cat: 'Driver Salaries', amount: 95000, change: 0 },
          { cat: 'Maintenance', amount: 48000, change: +6.7 },
          { cat: 'Tolls & Permits', amount: 22000, change: +12.8 },
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/ai/sos ────────────────────────────────────────────────────────
router.post('/sos', async (req: Request, res: Response) => {
  try {
    const { driverId, vehicleId, lat, lng, message } = req.body;

    // In production: trigger push notifications, SMS, etc.
    console.log(`🚨 SOS ACTIVATED — Driver: ${driverId}, Vehicle: ${vehicleId}, Location: ${lat},${lng}`);

    res.json({
      success: true,
      data: {
        sosId: `SOS-${Date.now()}`,
        status: 'DISPATCHED',
        notified: ['Fleet Manager', 'Safety Officer', 'Emergency Services'],
        timestamp: new Date().toISOString(),
        message: message || 'Emergency SOS activated',
        estimatedResponseTime: '8 minutes',
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/ai/document-expiry ────────────────────────────────────────────
router.get('/document-expiry', async (_req: Request, res: Response) => {
  try {
    const vehicles = await getVehicles();
    const drivers = await getDrivers();

    const today = new Date();
    const expiries: any[] = [];

    vehicles.forEach((v: any) => {
      const docs = [
        { doc: 'Insurance', date: v.insuranceExpiry },
        { doc: 'Fitness Certificate', date: v.fitnessExpiry },
        { doc: 'Pollution Certificate', date: v.pollutionExpiry },
      ];
      docs.forEach(({ doc, date }) => {
        if (!date) return;
        const expDate = new Date(date);
        const daysLeft = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
          expiries.push({
            entityId: v.id,
            entityType: 'vehicle',
            document: doc,
            expiryDate: date,
            daysLeft,
            severity: daysLeft <= 0 ? 'expired' : daysLeft <= 7 ? 'critical' : daysLeft <= 15 ? 'high' : 'medium',
          });
        }
      });
    });

    drivers.forEach((d: any) => {
      if (!d.licenseExpiry) return;
      const expDate = new Date(d.licenseExpiry);
      const daysLeft = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        expiries.push({
          entityId: d.id,
          entityType: 'driver',
          document: 'Driving License',
          expiryDate: d.licenseExpiry,
          daysLeft,
          severity: daysLeft <= 0 ? 'expired' : daysLeft <= 7 ? 'critical' : daysLeft <= 15 ? 'high' : 'medium',
        });
      }
    });

    expiries.sort((a, b) => a.daysLeft - b.daysLeft);

    res.json({ success: true, data: expiries });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/ai/copilot ───────────────────────────────────────────────────
router.post('/copilot', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, message: 'Query prompt required.' });
  try {
    const result = await askAiCopilot(query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/ai/dispatch-recommendation ───────────────────────────────────
router.post('/dispatch-recommendation', async (req: Request, res: Response) => {
  const { originId, destinationId, cargoWeightKG, cargoType } = req.body;
  try {
    const recommendations = await getDispatchRecommendations(originId, destinationId, cargoWeightKG, cargoType);
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/ai/what-if ───────────────────────────────────────────────────
router.post('/what-if', async (req: Request, res: Response) => {
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

