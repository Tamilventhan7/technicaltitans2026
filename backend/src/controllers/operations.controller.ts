import { Response } from 'express';
import { validationResult } from 'express-validator';
import { FuelLog, MaintenanceRecord, Expense, Vehicle, Driver, Trip } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { generatePdfReport, generateCsvReport, generateExcelReport } from '../utils/report.helper';

// Fuel Management
export async function getFuelLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await FuelLog.find({ isDeleted: false });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createFuelLog(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vehicleId, driverId, date, liters, cost, station, odometer } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId, isDeleted: false });
    if (!vehicle) {
      return res.status(404).json({ error: `Vehicle ${vehicleId} not found` });
    }

    // Business Rule: Fuel entry cannot exceed tank capacity.
    // If the fuel entered plus current fuel exceeds capacity, we block it.
    if (liters > vehicle.fuelCapacity) {
      return res.status(400).json({ 
        error: `Fuel entry of ${liters}L exceeds the total tank capacity (${vehicle.fuelCapacity}L) of vehicle ${vehicleId}.` 
      });
    }

    if (vehicle.currentFuel + liters > vehicle.fuelCapacity) {
      return res.status(400).json({
        error: `Fuel entry of ${liters}L would overflow the tank. Current fuel is ${vehicle.currentFuel}L, and capacity is ${vehicle.fuelCapacity}L.`
      });
    }

    const logId = `FL-${Date.now()}`;
    const newLog = await FuelLog.create({
      id: logId,
      vehicleId,
      driverId,
      date: new Date(date),
      liters,
      cost,
      station,
      odometer,
      theftDetected: false,
      createdBy: req.user?.id,
      isDeleted: false
    });

    // Update vehicle's fuel level and odometer
    vehicle.currentFuel = Math.min(vehicle.fuelCapacity, vehicle.currentFuel + liters);
    vehicle.odometer = Math.max(vehicle.odometer, odometer);
    await vehicle.save();

    res.status(201).json(newLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Maintenance Management
export async function getMaintenanceRecords(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await MaintenanceRecord.find({ isDeleted: false });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createMaintenanceRecord(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { vehicleId, date, type, cost, status, notes, partsReplaced } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId, isDeleted: false });
    if (!vehicle) {
      return res.status(404).json({ error: `Vehicle ${vehicleId} not found` });
    }

    const recordId = `MT-${Date.now()}`;
    const newRecord = await MaintenanceRecord.create({
      id: recordId,
      vehicleId,
      date: new Date(date),
      type,
      cost,
      status,
      notes,
      partsReplaced: partsReplaced || [],
      createdBy: req.user?.id,
      isDeleted: false
    });

    // Update vehicle status based on maintenance entry
    if (status === 'in-progress') {
      vehicle.status = 'maintenance';
    } else if (status === 'completed') {
      vehicle.status = 'idle';
      vehicle.healthScore = Math.min(100, vehicle.healthScore + 25); // restore health score slightly
    }
    await vehicle.save();

    res.status(201).json(newRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Expenses Management
export async function getExpenses(req: AuthenticatedRequest, res: Response) {
  try {
    const orgId = req.user?.organizationId || 'ORG-DEFAULT';
    const list = await Expense.find({ organizationId: orgId, isDeleted: false });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createExpense(req: AuthenticatedRequest, res: Response) {
  const { category, amount, description, date } = req.body;
  const orgId = req.user?.organizationId || 'ORG-DEFAULT';

  try {
    const expense = await Expense.create({
      id: `EXP-${Date.now()}`,
      organizationId: orgId,
      category,
      amount,
      description,
      status: 'pending',
      date: date ? new Date(date) : new Date(),
      createdBy: req.user?.id,
      isDeleted: false
    });

    res.status(201).json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function approveExpense(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'

  try {
    const expense = await Expense.findOne({ id, isDeleted: false });
    if (!expense) {
      return res.status(404).json({ error: 'Expense log not found' });
    }

    expense.status = status;
    expense.approvedBy = req.user?.id;
    await expense.save();

    res.json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Reports Generation
export async function downloadReport(req: AuthenticatedRequest, res: Response) {
  const { type, module } = req.query; // type: PDF, Excel, CSV; module: vehicles, drivers, trips, financial

  try {
    let dataset: any[] = [];
    let title = `${module} Report`.toUpperCase();

    if (module === 'vehicles') {
      dataset = await Vehicle.find({ isDeleted: false });
    } else if (module === 'drivers') {
      dataset = await Driver.find({ isDeleted: false });
    } else if (module === 'trips') {
      dataset = await Trip.find({ isDeleted: false });
    } else {
      dataset = await Expense.find({ isDeleted: false });
    }

    if (type === 'PDF') {
      const pdfBuffer = await generatePdfReport(title, dataset);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${module}_report.pdf"`);
      return res.send(pdfBuffer);
    } else if (type === 'CSV') {
      const csvData = generateCsvReport(dataset);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${module}_report.csv"`);
      return res.send(csvData);
    } else if (type === 'Excel') {
      const excelBuffer = generateExcelReport(dataset);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${module}_report.xlsx"`);
      return res.send(excelBuffer);
    }

    res.status(400).json({ error: 'Invalid report format request. Must be PDF, Excel or CSV.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
